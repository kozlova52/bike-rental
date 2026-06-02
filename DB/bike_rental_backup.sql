--
-- PostgreSQL database dump
--

\restrict yVD3aViSvv4JmHJgfhQsVAVfnT4ZLhawcGLB6AlucvT7roJx3hSl0NVNQTGcsWN

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

-- Started on 2026-06-01 22:28:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 230 (class 1255 OID 16625)
-- Name: calculate_rental_cost(text, text, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_rental_cost(start_time text, end_time text, price_per_hour numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    hours NUMERIC;
BEGIN
    hours :=
        EXTRACT(EPOCH FROM (start_time::timestamp - end_time::timestamp)) / 3600;

    RETURN ABS(hours * price_per_hour);
END;
$$;


ALTER FUNCTION public.calculate_rental_cost(start_time text, end_time text, price_per_hour numeric) OWNER TO postgres;

--
-- TOC entry 236 (class 1255 OID 16644)
-- Name: create_rental(integer, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.create_rental(IN p_user_id integer, IN p_bicycle_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO rentals("userId", "bicycleId", "startTime", status)
    VALUES (p_user_id, p_bicycle_id, NOW()::TEXT, 'active');
END;
$$;


ALTER PROCEDURE public.create_rental(IN p_user_id integer, IN p_bicycle_id integer) OWNER TO postgres;

--
-- TOC entry 237 (class 1255 OID 16645)
-- Name: finish_rental(integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.finish_rental(IN p_rental_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE rentals
    SET status = 'completed',
        "endTime" = NOW()::TEXT
    WHERE id = p_rental_id;
END;
$$;


ALTER PROCEDURE public.finish_rental(IN p_rental_id integer) OWNER TO postgres;

--
-- TOC entry 232 (class 1255 OID 16627)
-- Name: get_average_rental_duration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_average_rental_duration() RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE result NUMERIC;
BEGIN
    SELECT AVG(
        EXTRACT(EPOCH FROM (endTime::timestamp - startTime::timestamp)) / 3600
    )
    INTO result
    FROM rentals
    WHERE "endTime" IS NOT NULL;

    RETURN result;
END;
$$;


ALTER FUNCTION public.get_average_rental_duration() OWNER TO postgres;

--
-- TOC entry 231 (class 1255 OID 16626)
-- Name: get_user_rentals_count(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_rentals_count(p_user_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE result INT;
BEGIN
    SELECT COUNT(*)
    INTO result
    FROM rentals
    WHERE "userId" = p_user_id;

    RETURN result;
END;
$$;


ALTER FUNCTION public.get_user_rentals_count(p_user_id integer) OWNER TO postgres;

--
-- TOC entry 235 (class 1255 OID 16642)
-- Name: log_rental_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_rental_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO rental_history(rental_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_rental_changes() OWNER TO postgres;

--
-- TOC entry 238 (class 1255 OID 16646)
-- Name: send_bicycle_to_repair(integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.send_bicycle_to_repair(IN p_bicycle_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE bicycles
    SET status = 'repair'
    WHERE id = p_bicycle_id;
END;
$$;


ALTER PROCEDURE public.send_bicycle_to_repair(IN p_bicycle_id integer) OWNER TO postgres;

--
-- TOC entry 234 (class 1255 OID 16630)
-- Name: set_bicycle_available(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_bicycle_available() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE bicycles
        SET status = 'available'
        WHERE id = NEW."bicycleId";
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_bicycle_available() OWNER TO postgres;

--
-- TOC entry 233 (class 1255 OID 16628)
-- Name: set_bicycle_rented(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_bicycle_rented() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE bicycles
    SET status = 'rented'
    WHERE id = NEW."bicycleId";

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_bicycle_rented() OWNER TO postgres;

--
-- TOC entry 239 (class 1255 OID 16747)
-- Name: update_point_available_bikes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_point_available_bikes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Обновляем количество доступных велосипедов для пункта, где изменился статус
    UPDATE rental_points 
    SET "availableBikes" = (
        SELECT COUNT(*) 
        FROM bicycles 
        WHERE "rentalPointId" = COALESCE(NEW."rentalPointId", OLD."rentalPointId")
        AND status = 'available'
    )
    WHERE id = COALESCE(NEW."rentalPointId", OLD."rentalPointId");
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_point_available_bikes() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 16681)
-- Name: bicycles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bicycles (
    id integer NOT NULL,
    model character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    "pricePerHour" numeric NOT NULL,
    status character varying(50) DEFAULT 'available'::character varying,
    "rentalPointId" integer,
    image character varying(255),
    description text
);


ALTER TABLE public.bicycles OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16588)
-- Name: rentals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rentals (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "bicycleId" integer NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    "pointId" integer NOT NULL,
    hours integer NOT NULL,
    "startDate" character varying NOT NULL,
    "endDate" character varying,
    "totalPrice" numeric NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rentals OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16557)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    age integer NOT NULL,
    role character varying DEFAULT 'client'::character varying NOT NULL,
    phone character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16749)
-- Name: active_rentals_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_rentals_view AS
 SELECT r.id,
    u.name AS user_name,
    b.model AS bike_model,
    r."startDate",
    r.hours,
    r."totalPrice"
   FROM ((public.rentals r
     JOIN public.users u ON ((r."userId" = u.id)))
     JOIN public.bicycles b ON ((r."bicycleId" = b.id)))
  WHERE ((r.status)::text = 'active'::text);


ALTER VIEW public.active_rentals_view OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16579)
-- Name: rental_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_points (
    id integer NOT NULL,
    name character varying NOT NULL,
    address character varying NOT NULL,
    capacity integer NOT NULL,
    phone character varying,
    "workHours" character varying,
    "availableBikes" integer DEFAULT 0,
    rating numeric DEFAULT '0'::numeric,
    description text,
    image character varying
);


ALTER TABLE public.rental_points OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16754)
-- Name: available_bicycles_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.available_bicycles_view AS
 SELECT b.id,
    b.model,
    b.type,
    b.status,
    rp.name AS point_name,
    rp.address
   FROM (public.bicycles b
     JOIN public.rental_points rp ON ((b."rentalPointId" = rp.id)))
  WHERE ((b.status)::text = 'available'::text);


ALTER VIEW public.available_bicycles_view OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16680)
-- Name: bicycles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bicycles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bicycles_id_seq OWNER TO postgres;

--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 226
-- Name: bicycles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bicycles_id_seq OWNED BY public.bicycles.id;


--
-- TOC entry 224 (class 1259 OID 16633)
-- Name: rental_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_history (
    id integer NOT NULL,
    rental_id integer,
    old_status text,
    new_status text,
    changed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.rental_history OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16632)
-- Name: rental_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rental_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rental_history_id_seq OWNER TO postgres;

--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 223
-- Name: rental_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rental_history_id_seq OWNED BY public.rental_history.id;


--
-- TOC entry 219 (class 1259 OID 16578)
-- Name: rental_points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rental_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rental_points_id_seq OWNER TO postgres;

--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 219
-- Name: rental_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rental_points_id_seq OWNED BY public.rental_points.id;


--
-- TOC entry 221 (class 1259 OID 16587)
-- Name: rentals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rentals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rentals_id_seq OWNER TO postgres;

--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 221
-- Name: rentals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rentals_id_seq OWNED BY public.rentals.id;


--
-- TOC entry 225 (class 1259 OID 16655)
-- Name: user_rental_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_rental_summary AS
 SELECT u.id AS user_id,
    u.name AS user_name,
    u.email,
    count(r.id) AS total_rentals,
    COALESCE(sum(r."totalPrice"), (0)::numeric) AS total_spent,
    COALESCE(avg(r.hours), (0)::numeric) AS avg_hours
   FROM (public.users u
     LEFT JOIN public.rentals r ON ((r."userId" = u.id)))
  GROUP BY u.id, u.name, u.email;


ALTER VIEW public.user_rental_summary OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16556)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4795 (class 2604 OID 16684)
-- Name: bicycles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bicycles ALTER COLUMN id SET DEFAULT nextval('public.bicycles_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 16636)
-- Name: rental_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_history ALTER COLUMN id SET DEFAULT nextval('public.rental_history_id_seq'::regclass);


--
-- TOC entry 4786 (class 2604 OID 16582)
-- Name: rental_points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_points ALTER COLUMN id SET DEFAULT nextval('public.rental_points_id_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 16591)
-- Name: rentals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals ALTER COLUMN id SET DEFAULT nextval('public.rentals_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 16560)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4971 (class 0 OID 16681)
-- Dependencies: 227
-- Data for Name: bicycles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bicycles (id, model, type, "pricePerHour", status, "rentalPointId", image, description) FROM stdin;
2	Stels Navigator	Городской	200	available	1	/images/stels.jpg	Городской велосипед для комфортных ежедневных поездок по городу. Удобное сиденье, надежные тормоза, легкий вес. Отлично подходит для прогулок в парке и поездок на работу.
8	Stels Navigator	Городской	200	available	3	/images/stels.jpg	Городской велосипед для комфортных ежедневных поездок по городу. Удобное сиденье, надежные тормоза, легкий вес. Отлично подходит для прогулок в парке и поездок на работу.
5	Stels Navigator	Городской	200	available	2	/images/stels.jpg	Городской велосипед для комфортных ежедневных поездок по городу. Удобное сиденье, надежные тормоза, легкий вес. Отлично подходит для прогулок в парке и поездок на работу.
7	BMX	Трюковой	250	available	3	/images/bmx.jpg	Велосипед предназначен для выполнения трюков в основном с применением трамплинов, насыпей и рамп. Идеален для скейт-парков и экстремального катания.
4	BMX	Трюковой	250	available	2	/images/bmx.jpg	Велосипед предназначен для выполнения трюков в основном с применением трамплинов, насыпей и рамп. Идеален для скейт-парков и экстремального катания.
1	BMX	Трюковой	250	available	1	/images/bmx.jpg	Велосипед предназначен для выполнения трюков в основном с применением трамплинов, насыпей и рамп. Идеален для скейт-парков и экстремального катания.
3	Cube Acid	Горный	350	available	1	/images/cube.jpg	Горный велосипед для бездорожья и длительных маршрутов. Профессиональная амортизация, надежные дисковые тормоза, прочная рама. Преодолеет любые препятствия.
6	Cube Acid	Горный	350	available	2	/images/cube.jpg	Горный велосипед для бездорожья и длительных маршрутов. Профессиональная амортизация, надежные дисковые тормоза, прочная рама. Преодолеет любые препятствия.
9	Cube Acid	Горный	350	available	3	/images/cube.jpg	Горный велосипед для бездорожья и длительных маршрутов. Профессиональная амортизация, надежные дисковые тормоза, прочная рама. Преодолеет любые препятствия.
\.


--
-- TOC entry 4969 (class 0 OID 16633)
-- Dependencies: 224
-- Data for Name: rental_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rental_history (id, rental_id, old_status, new_status, changed_at) FROM stdin;
1	3	active	completed	2026-06-01 18:38:23.877502
2	1	active	completed	2026-06-01 19:58:06.627082
3	2	active	completed	2026-06-01 20:08:43.562875
4	4	active	completed	2026-06-01 20:13:17.442062
5	3	active	completed	2026-06-01 20:13:19.080531
6	6	active	completed	2026-06-01 21:06:22.11421
7	7	active	completed	2026-06-01 21:06:23.744514
8	5	active	completed	2026-06-01 21:06:25.501327
9	8	active	completed	2026-06-01 21:24:43.245623
10	9	active	completed	2026-06-01 21:25:35.141708
11	10	active	completed	2026-06-01 21:27:31.413304
\.


--
-- TOC entry 4965 (class 0 OID 16579)
-- Dependencies: 220
-- Data for Name: rental_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rental_points (id, name, address, capacity, phone, "workHours", "availableBikes", rating, description, image) FROM stdin;
1	Центральный парк	ул. Тверская, 15, Москва	30	+7 (495) 123-45-67	09:00 - 22:00	3	4.8	\N	\N
3	ВДНХ	просп. Мира, 119, Москва	40	+7 (495) 345-67-89	09:00 - 20:00	3	4.7	\N	\N
2	Парк Горького	Крымский Вал, 9, Москва	25	+7 (495) 234-56-78	10:00 - 21:00	3	4.9	\N	\N
\.


--
-- TOC entry 4967 (class 0 OID 16588)
-- Dependencies: 222
-- Data for Name: rentals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rentals (id, "userId", "bicycleId", status, "pointId", hours, "startDate", "endDate", "totalPrice", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4963 (class 0 OID 16557)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, age, role, phone) FROM stdin;
1	Vika	vika@mail.com	20	client	\N
2	виктория 	vikarewqb@gmail.com	19	client	\N
5	Администратор	admin@mail.ru	25	admin	\N
6	света	test@mail.ru	19	client	\N
\.


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 226
-- Name: bicycles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bicycles_id_seq', 10, true);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 223
-- Name: rental_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rental_history_id_seq', 11, true);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 219
-- Name: rental_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rental_points_id_seq', 1, false);


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 221
-- Name: rentals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rentals_id_seq', 10, true);


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- TOC entry 4804 (class 2606 OID 16597)
-- Name: rentals PK_2b10d04c95a8bfe85b506ba52ba; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals
    ADD CONSTRAINT "PK_2b10d04c95a8bfe85b506ba52ba" PRIMARY KEY (id);


--
-- TOC entry 4802 (class 2606 OID 16586)
-- Name: rental_points PK_75b9743eb35f3c11c77801a35a0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_points
    ADD CONSTRAINT "PK_75b9743eb35f3c11c77801a35a0" PRIMARY KEY (id);


--
-- TOC entry 4798 (class 2606 OID 16565)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 4800 (class 2606 OID 16567)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 4808 (class 2606 OID 16689)
-- Name: bicycles bicycles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bicycles
    ADD CONSTRAINT bicycles_pkey PRIMARY KEY (id);


--
-- TOC entry 4806 (class 2606 OID 16641)
-- Name: rental_history rental_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_history
    ADD CONSTRAINT rental_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2620 OID 16631)
-- Name: rentals trg_bicycle_available; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_bicycle_available AFTER UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.set_bicycle_available();


--
-- TOC entry 4811 (class 2620 OID 16629)
-- Name: rentals trg_bicycle_rented; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_bicycle_rented AFTER INSERT ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.set_bicycle_rented();


--
-- TOC entry 4812 (class 2620 OID 16643)
-- Name: rentals trg_rental_history; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_rental_history AFTER UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.log_rental_changes();


--
-- TOC entry 4813 (class 2620 OID 16748)
-- Name: bicycles trigger_update_point_bikes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_point_bikes AFTER INSERT OR DELETE OR UPDATE OF status ON public.bicycles FOR EACH ROW EXECUTE FUNCTION public.update_point_available_bikes();


--
-- TOC entry 4809 (class 2606 OID 16690)
-- Name: bicycles bicycles_rentalPointId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bicycles
    ADD CONSTRAINT "bicycles_rentalPointId_fkey" FOREIGN KEY ("rentalPointId") REFERENCES public.rental_points(id) ON DELETE SET NULL;


-- Completed on 2026-06-01 22:28:33

--
-- PostgreSQL database dump complete
--

\unrestrict yVD3aViSvv4JmHJgfhQsVAVfnT4ZLhawcGLB6AlucvT7roJx3hSl0NVNQTGcsWN

