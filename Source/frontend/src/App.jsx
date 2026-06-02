import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [loginPassword, setLoginPassword] = useState("");
  const [bicycles, setBicycles] = useState([]);
  const [rentalPoints, setRentalPoints] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [toast, setToast] = useState("");
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [page, setPage] = useState(
    localStorage.getItem("page") || "bicycles"
  );
  const [rentalForm, setRentalForm] = useState({
    bicycleId: "",
    pointId: "",
    hours: 1,
    startDate: new Date().toISOString().slice(0, 16)
  });
  
  // Состояние для велосипедов выбранного пункта
  const [pointBicycles, setPointBicycles] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    role: "client",
    phone: "",
    password: ""
    
  });
    const [authMode, setAuthMode] = useState("login"); // "login" или "register"
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    age: "",
    phone: "",
    password: ""
  });

const [editingPoint, setEditingPoint] = useState(null);
const [editPointForm, setEditPointForm] = useState({
  name: "",
  address: "",
  phone: "",
  workHours: "",
  rating: "",
  capacity: ""
});

const [newBike, setNewBike] = useState({
  model: "",
  type: "",
  pricePerHour: "",
  rentalPointId: "",
  image: "",
  description: ""
});
  // Дефолтные велосипеды (3 уникальных)
  const defaultBicycles = [
    {
      id: 1,
      model: "BMX",
      type: "Трюковой",
      pricePerHour: 250,
      status: "available",
      image: "/images/bmx.jpg",
      description: "Трюковой велосипед для экстремального катания и прыжков.",
      speed: "35 км/ч",
      weight: "11 кг",
      frame: "Сталь"
    },
    {
      id: 2,
      model: "Stels Navigator",
      type: "Городской",
      pricePerHour: 200,
      status: "available",
      image: "/images/stels.jpg",
      description: "Универсальный городской велосипед для ежедневных поездок.",
      speed: "30 км/ч",
      weight: "13 кг",
      frame: "Алюминий"
    },
    {
      id: 3,
      model: "Cube Acid",
      type: "Горный",
      pricePerHour: 350,
      status: "available",
      image: "/images/cube.jpg",
      description: "Премиальный горный велосипед для бездорожья.",
      speed: "40 км/ч",
      weight: "12 кг",
      frame: "Карбон"
    }
  ];

  useEffect(() => {
    loadUsers();
    loadBicycles();
    loadRentalPoints();
    loadRentals();
  }, []);

  const loadUsers = () => {
    fetch("http://localhost:3000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(err => console.error("Ошибка загрузки пользователей:", err));
  };
    const register = async () => {
  if (!registerForm.name || !registerForm.email || !registerForm.age || !registerForm.password) {
    alert("Заполните имя, email, возраст и пароль");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: registerForm.name,
        email: registerForm.email,
        age: Number(registerForm.age),
        role: "client",
        phone: registerForm.phone || "",
        password: registerForm.password
      }),
    });

    if (response.ok) {
      showToast("Регистрация успешна! Теперь войдите");
      setAuthMode("login");
      setRegisterForm({ name: "", email: "", age: "", phone: "", password: "" });
      loadUsers();
    } else {
      const error = await response.json();
      alert(error.message || "Ошибка при регистрации. Возможно, email уже существует");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Ошибка сервера");
  }
};

  const loadBicycles = () => {
    fetch("http://localhost:3000/bicycles")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setBicycles(data);
        } else {
          setBicycles(defaultBicycles);
        }
      })
      .catch(err => {
        console.error("Ошибка загрузки велосипедов:", err);
        setBicycles(defaultBicycles);
      });
  };

  const loadRentalPoints = () => {
    fetch("http://localhost:3000/rental-points")
      .then((res) => res.json())
      .then((data) => setRentalPoints(data))
      .catch(err => console.error("Ошибка загрузки пунктов:", err));
  };

  const loadRentals = () => {
    fetch("http://localhost:3000/rentals")
      .then((res) => res.json())
      .then((data) => setRentals(data))
      .catch(err => console.error("Ошибка загрузки аренд:", err));
  };

  // Функция загрузки велосипедов по выбранному пункту проката
const loadBicyclesByPoint = async (pointId) => {
  if (!pointId) {
    setPointBicycles([]);
    return;
  }
  try {
    const response = await fetch(`http://localhost:3000/bicycles`);
    const allBikes = await response.json();
    console.log("Все велосипеды:", allBikes);  // ← добавить
    console.log("ID пункта:", pointId);        // ← добавить
    // Фильтруем велосипеды по выбранному пункту
    const filtered = allBikes.filter(bike => bike.rentalPointId === parseInt(pointId));
    console.log("Отфильтрованные:", filtered); // ← добавить
    setPointBicycles(filtered);
  } catch (error) {
    console.error("Ошибка:", error);
  }
};

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const login = () => {
  console.log("Введенный email:", loginEmail);
  console.log("Введенный пароль:", loginPassword);
  console.log("Пользователи из БД:", users);
  
  const user = users.find(
    (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && 
    u.password === loginPassword
  );
  
  console.log("Найденный пользователь:", user);

  if (!user) {
    alert("Неверный email или пароль");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  setCurrentUser(user);
  setLoginEmail("");
  setLoginPassword("");
  showToast("Добро пожаловать, " + user.name + "!");
};

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    showToast("Вы вышли из системы");
  };

  const changePage = (newPage) => {
    setPage(newPage);
    localStorage.setItem("page", newPage);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addUser = async (e) => {
  e.preventDefault();

  const response = await fetch("http://localhost:3000/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: form.name,
      email: form.email,
      age: Number(form.age),
      role: form.role,
      phone: form.phone,
      password: form.password || "123456"
    }),
  });

  if (response.ok) {
    setForm({
      name: "",
      email: "",
      age: "",
      role: "client",
      phone: "",
      password: ""
    });
    loadUsers();
    showToast("Пользователь добавлен!");
  } else {
    showToast("Ошибка при добавлении");
  }
};
  const calculateRentalPrice = (bicycleId, hours) => {
    const bicycle = bicycles.find(b => b.id === Number(bicycleId));
    if (!bicycle) return 0;
    return bicycle.pricePerHour * hours;
  };

  const createRental = async (e) => {
    e.preventDefault();
    
    if (!rentalForm.bicycleId || !rentalForm.pointId) {
      showToast("Выберите велосипед и пункт проката!");
      return;
    }
    
    const totalPrice = calculateRentalPrice(
      rentalForm.bicycleId, 
      rentalForm.hours
    );
    
    try {
      const response = await fetch("http://localhost:3000/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          bicycleId: Number(rentalForm.bicycleId),
          pointId: Number(rentalForm.pointId),
          hours: Number(rentalForm.hours),
          startDate: rentalForm.startDate,
          totalPrice: totalPrice,
          status: "active"
        }),
      });
      
      if (response.ok) {
        showToast("Аренда оформлена!");
        loadRentals();
        loadBicycles();
        loadRentalPoints();
        setRentalForm({
          bicycleId: "",
          pointId: "",
          hours: 1,
          startDate: new Date().toISOString().slice(0, 16)
        });
        setPointBicycles([]);
      } else {
        const error = await response.json();
        showToast(error.message || "Ошибка при оформлении аренды");
      }
    } catch (error) {
      showToast("Ошибка сервера");
    }
  };

  const completeRental = async (rentalId, bicycleId, pointId) => {
    try {
      const response = await fetch(`http://localhost:3000/rentals/${rentalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          endDate: new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        showToast("Аренда завершена!");
        loadRentals();
        loadBicycles();
        loadRentalPoints();
      }
    } catch (error) {
      showToast("Ошибка при завершении");
    }
  };

  const deleteRental = async (rentalId, bicycleId, pointId) => {
    if (!confirm("Вы уверены, что хотите удалить эту аренду?")) return;
    
    try {
      const deleteResponse = await fetch(`http://localhost:3000/rentals/${rentalId}`, {
        method: "DELETE",
      });
      
      if (!deleteResponse.ok) {
        showToast("Ошибка при удалении аренды");
        return;
      }
      
      const updateResponse = await fetch(`http://localhost:3000/bicycles/${bicycleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "available"
        }),
      });
      
      if (updateResponse.ok) {
        showToast("Аренда удалена! Велосипед снова доступен");
      } else {
        showToast("Аренда удалена, но статус велосипеда не обновлен");
      }
      
      loadRentals();
      loadBicycles();
      loadRentalPoints();
      
    } catch (error) {
      console.error("Ошибка:", error);
      showToast("Ошибка сервера");
    }
  };

  // Уникальные велосипеды для главной страницы
  const uniqueBicycles = bicycles.filter((bike, index, self) => 
    index === self.findIndex(b => b.model === bike.model)
  );

  // Начать редактирование пункта
const startEditPoint = (point) => {
  setEditingPoint(point);
  setEditPointForm({
    name: point.name,
    address: point.address,
    phone: point.phone || "",
    workHours: point.workHours || "",
    rating: point.rating || "",
    capacity: point.capacity || ""
  });
};

// Сохранить изменения пункта
const savePointChanges = async () => {
  try {
    const response = await fetch(`http://localhost:3000/rental-points/${editingPoint.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editPointForm.name,
        address: editPointForm.address,
        phone: editPointForm.phone,
        workHours: editPointForm.workHours,
        rating: parseFloat(editPointForm.rating),
        capacity: parseInt(editPointForm.capacity)
      }),
    });

    if (response.ok) {
      showToast("Пункт проката обновлен!");
      loadRentalPoints();
      setEditingPoint(null);
    } else {
      showToast("Ошибка при обновлении");
    }
  } catch (error) {
    showToast("Ошибка сервера");
  }
};

// Добавить новый велосипед
const addBicycle = async (e) => {
  e.preventDefault();
  
  if (!newBike.model || !newBike.type || !newBike.pricePerHour || !newBike.rentalPointId) {
    showToast("Заполните все обязательные поля");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/bicycles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: newBike.model,
        type: newBike.type,
        pricePerHour: Number(newBike.pricePerHour),
        status: "available",
        rentalPointId: parseInt(newBike.rentalPointId),
        image: newBike.image || null,
        description: newBike.description
      }),
    });

    if (response.ok) {
      showToast("Велосипед добавлен!");
      setNewBike({
        model: "",
        type: "",
        pricePerHour: "",
        rentalPointId: "",
        image: "",
        description: ""
      });
      loadBicycles();
    } else {
      showToast("Ошибка при добавлении");
    }
  } catch (error) {
    showToast("Ошибка сервера");
  }
};
   // Удаление велосипеда
const deleteBicycle = async (bicycleId, bicycleModel) => {
  if (!confirm(`Вы уверены, что хотите удалить велосипед "${bicycleModel}"?`)) return;
  
  try {
    const response = await fetch(`http://localhost:3000/bicycles/${bicycleId}`, {
      method: "DELETE",
    });
    
    if (response.ok) {
      showToast(`Велосипед "${bicycleModel}" удален!`);
      loadBicycles(); // Обновляем список велосипедов
    } else {
      showToast("Ошибка при удалении велосипеда");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    showToast("Ошибка сервера");
  }
};

    if (!currentUser) {
    return (
      <div className="app">
        <div className="card login-card">
          <h1>Bike Rental Moscow</h1>
          
          <div className="auth-tabs">
            <button 
              className={authMode === "login" ? "active" : ""} 
              onClick={() => setAuthMode("login")}
            >
              Вход
            </button>
            <button 
              className={authMode === "register" ? "active" : ""} 
              onClick={() => setAuthMode("register")}
            >
              Регистрация
            </button>
          </div>

          {authMode === "login" && (
            <>
              <p>Введите email для входа</p>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && login()}
              />
              <input
                type="password"
                placeholder="Пароль"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button onClick={login}>Войти</button>
            </>
          )}

          {authMode === "register" && (
            <>
              <p>Создайте новый аккаунт</p>
              <input
                type="text"
                placeholder="Имя"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
              />
              <input
                type="number"
                placeholder="Возраст"
                value={registerForm.age}
                onChange={(e) => setRegisterForm({...registerForm, age: e.target.value})}
              />
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={form.password}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Телефон (необязательно)"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
              />
              <button onClick={register}>Зарегистрироваться</button>
            </>
          )}

          <div style={{ marginTop: 20, fontSize: 12, color: "#999", textAlign: "center" }}>
            <p>Тестовые пользователи:</p>
            {users.map(user => (
              <p key={user.id}>{user.email} - {user.name} {user.role === "admin" ? "(Админ)" : ""}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      <h1>Прокат велосипедов в Москве</h1>

      <div className="card">
        <div className="user-info">
          <h2>Здравствуйте, {currentUser.name} {currentUser.role === "admin" && "(Администратор)"}</h2>
          <button onClick={logout} className="logout-btn">Выйти</button>
        </div>
      </div>

      <div className="menu">
        <button onClick={() => changePage("bicycles")}>Велосипеды</button>
        <button onClick={() => changePage("points")}>Пункты проката</button>
        <button onClick={() => changePage("rentals")}>Мои аренды</button>
        {currentUser.role === "admin" && (
          <button onClick={() => changePage("users")}>Пользователи</button>
        )}
      </div>

      {/* ВЕЛОСИПЕДЫ */}
{page === "bicycles" && (
  <>
    {/* ФОРМА ДОБАВЛЕНИЯ ВЕЛОСИПЕДА (только для админа) */}
    {currentUser.role === "admin" && (
      <div className="card">
        <h2>Добавить новый велосипед</h2>
        <form onSubmit={addBicycle}>
          <input
            type="text"
            placeholder="Модель"
            value={newBike.model}
            onChange={(e) => setNewBike({...newBike, model: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Тип"
            value={newBike.type}
            onChange={(e) => setNewBike({...newBike, type: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Цена за час"
            value={newBike.pricePerHour}
            onChange={(e) => setNewBike({...newBike, pricePerHour: e.target.value})}
            required
          />
          <select
            value={newBike.rentalPointId}
            onChange={(e) => setNewBike({...newBike, rentalPointId: e.target.value})}
            required
          >
            <option value="">Выберите пункт проката</option>
            {rentalPoints.map(point => (
              <option key={point.id} value={point.id}>
                {point.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="URL картинки (опционально)"
            value={newBike.image}
            onChange={(e) => setNewBike({...newBike, image: e.target.value})}
          />
          <textarea
            placeholder="Описание (опционально)"
            value={newBike.description}
            onChange={(e) => setNewBike({...newBike, description: e.target.value})}
            rows="2"
          />
          <button type="submit">Добавить велосипед</button>
        </form>
      </div>
    )}

    {/* СПИСОК ВЕЛОСИПЕДОВ */}
    {!selectedBike ? (
      <div className="card">
        <h2>Выберите велосипед</h2>
        <div className="bicycles-grid">
          {uniqueBicycles.map((bike) => (
            <div key={bike.id} className="bike-card">
              <div onClick={() => setSelectedBike(bike)} style={{ cursor: 'pointer' }}>
                <img 
                  src={bike.image || `/images/${bike.model?.toLowerCase().split(' ')[0]}.jpg`}
                  alt={bike.model}
                  className="bike-preview"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1571066811602-716837fcd7e8?w=400";
                  }}
                />
                <h3>{bike.model}</h3>
                <p>{bike.type}</p>
                <p className="bike-price">{bike.pricePerHour} ₽/час</p>
                <span className="bike-status available">Доступен</span>
              </div>
              {/* Кнопка удаления (только для админа) */}
              {currentUser.role === "admin" && (
                <button 
                  className="delete-bike-btn"
                  onClick={() => deleteBicycle(bike.id, bike.model)}
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="card">
        <button onClick={() => setSelectedBike(null)} className="back-btn">
          ← Назад к списку
        </button>
        <div className="bike-detail">
          <h2>{selectedBike.model}</h2>
          <img 
            src={selectedBike.image || `/images/${selectedBike.model?.toLowerCase().split(' ')[0]}.jpg`}
            alt={selectedBike.model}
            className="bike-big"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1571066811602-716837fcd7e8?w=400";
            }}
          />
          <div className="bike-specs">
            <p><b>Тип:</b> {selectedBike.type}</p>
            <p><b>Цена:</b> {selectedBike.pricePerHour} ₽/час</p>
            <p><b>Описание:</b> {selectedBike.description || "Отличный велосипед для комфортной поездки"}</p>
          </div>
          
          <button 
            className="rent-now-btn"
            onClick={() => changePage("rentals")}
          >
            Арендовать сейчас
          </button>
        </div>
      </div>
    )}
  </>
)}

{/* ПУНКТЫ ПРОКАТА */}
{page === "points" && (
  <>
    <div className="card">
      <h2>Пункты проката в Москве</h2>
      <div className="points-grid">
        {rentalPoints.map((point) => (
          <div key={point.id} className="point-card">
            <div onClick={() => setSelectedPoint(point)} style={{ cursor: 'pointer' }}>
              <h3>{point.name}</h3>
              <p>{point.address}</p>
              <p>{point.phone || "Не указан"}</p>
              <p>{point.workHours || "09:00 - 21:00"}</p>
              <div className="point-stats">
                <span>⭐{point.rating || "4.5"}/5</span> 
                <span> {point.availableBikes || "0"} велосипедов в наличии</span>
              </div>
            </div>
            {/* Кнопка редактирования (только для админа) */}
            {currentUser.role === "admin" && (
              <button 
                className="edit-point-btn"
                onClick={() => startEditPoint(point)}
              >
                Редактировать
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
    
    {selectedPoint && (
      <div className="modal-overlay" onClick={() => setSelectedPoint(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setSelectedPoint(null)}>✕</button>
          <h2>{selectedPoint.name}</h2>
          <div className="point-details">
            <p><strong>Адрес:</strong> {selectedPoint.address}</p>
            <p><strong>Телефон:</strong> {selectedPoint.phone || "Не указан"}</p>
            <p><strong>Режим работы:</strong> {selectedPoint.workHours || "09:00 - 21:00"}</p>
            <p><strong>Доступно велосипедов:</strong> {selectedPoint.availableBikes || "0"}</p>
            <p><strong>Рейтинг:</strong> {selectedPoint.rating || "4.5"}/5</p>
            <p><strong>Описание:</strong> {selectedPoint.description || "Уютный пункт проката с широким выбором велосипедов"}</p>
          </div>
          <button className="rent-btn" onClick={() => {
            setRentalForm({...rentalForm, pointId: selectedPoint.id});
            changePage("rentals");
            setSelectedPoint(null);
          }}>
            Арендовать здесь
          </button>
        </div>
      </div>
    )}

    {/* Модальное окно редактирования пункта (только для админа) */}
    {editingPoint && currentUser.role === "admin" && (
      <div className="modal-overlay" onClick={() => setEditingPoint(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Редактировать {editingPoint.name}</h2>
          <input
            type="text"
            placeholder="Название"
            value={editPointForm.name}
            onChange={(e) => setEditPointForm({...editPointForm, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Адрес"
            value={editPointForm.address}
            onChange={(e) => setEditPointForm({...editPointForm, address: e.target.value})}
          />
          <input
            type="text"
            placeholder="Телефон"
            value={editPointForm.phone}
            onChange={(e) => setEditPointForm({...editPointForm, phone: e.target.value})}
          />
          <input
            type="text"
            placeholder="Режим работы"
            value={editPointForm.workHours}
            onChange={(e) => setEditPointForm({...editPointForm, workHours: e.target.value})}
          />
          <input
            type="number"
            placeholder="Рейтинг"
            step="0.1"
            value={editPointForm.rating}
            onChange={(e) => setEditPointForm({...editPointForm, rating: e.target.value})}
          />
          <input
            type="number"
            placeholder="Вместимость"
            value={editPointForm.capacity}
            onChange={(e) => setEditPointForm({...editPointForm, capacity: e.target.value})}
          />
          <div className="modal-buttons">
            <button onClick={savePointChanges}>Сохранить</button>
            <button onClick={() => setEditingPoint(null)} className="cancel-btn">Отмена</button>
          </div>
        </div>
      </div>
    )}
  </>
)}

     

      {/* АРЕНДЫ */}
      {page === "rentals" && (
  <>
    <div className="card">
      <h2>Оформить аренду</h2>
      <form onSubmit={createRental}>
        <select 
          value={rentalForm.pointId} 
          onChange={(e) => {
            const pointId = e.target.value;
            setRentalForm({...rentalForm, pointId: pointId, bicycleId: ""});
            if (pointId) loadBicyclesByPoint(pointId);
          }}
          required
        >
          <option value="">Выберите пункт проката</option>
          {rentalPoints.map(point => (
            <option key={point.id} value={point.id}>
              {point.name} - {point.address}
            </option>
          ))}
        </select>
        
        <select 
          value={rentalForm.bicycleId} 
          onChange={(e) => setRentalForm({...rentalForm, bicycleId: e.target.value})}
          required
          disabled={!rentalForm.pointId}
        >
          <option value="">Выберите велосипед</option>
          {pointBicycles.filter(b => b.status === "available").map(bike => (
            <option key={bike.id} value={bike.id}>
              {bike.model} - {bike.type} - {bike.pricePerHour} руб/час
            </option>
          ))}
        </select>
        
        <input
          type="number"
          placeholder="Количество часов (1-24)"
          value={rentalForm.hours}
          onChange={(e) => setRentalForm({...rentalForm, hours: e.target.value})}
          min="1"
          max="24"
          required
        />
        
        <input
          type="datetime-local"
          value={rentalForm.startDate}
          onChange={(e) => setRentalForm({...rentalForm, startDate: e.target.value})}
          required
        />
        
        {rentalForm.bicycleId && rentalForm.hours && (
          <div className="price-preview">
            Итого: {calculateRentalPrice(rentalForm.bicycleId, rentalForm.hours)} руб
          </div>
        )}
        
        <button type="submit">Оформить аренду</button>
      </form>
    </div>
    
    <div className="card">
      <h2>Мои аренды</h2>
      {rentals.filter(r => r.userId === currentUser.id).length === 0 ? (
        <p>У вас пока нет аренд</p>
      ) : (
        <div className="rentals-list">
          {rentals
            .filter(rental => rental.userId === currentUser.id)
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .map(rental => {
              const bike = bicycles.find(b => b.id === rental.bicycleId);
              const point = rentalPoints.find(p => p.id === rental.pointId);
              
              return (
                <div key={rental.id} className={`rental-item ${rental.status}`}>
                  <div className="rental-header">
                    <h3>{bike?.model || "Велосипед"}</h3>
                    <span className={`status-badge ${rental.status}`}>
                      {rental.status === "active" ? "Активна" : "Завершена"}
                    </span>
                  </div>
                  <p>Пункт: {point?.name || "Пункт проката"}</p>
                  <p>Начало: {new Date(rental.startDate).toLocaleString()}</p>
                  {rental.endDate && (
                    <p>Завершена: {new Date(rental.endDate).toLocaleString()}</p>
                  )}
                  <p>Часов: {rental.hours}</p>
                  <p><strong>Стоимость: {rental.totalPrice} руб</strong></p>
                  <div className="rental-buttons">
                    {rental.status === "active" && (
                      <button 
                        className="complete-btn"
                        onClick={() => completeRental(rental.id, rental.bicycleId, rental.pointId)}
                      >
                        Завершить аренду
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => deleteRental(rental.id, rental.bicycleId, rental.pointId)}
                    >
                      Удалить аренду
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  </>
)}

      {/* ПОЛЬЗОВАТЕЛИ (только админ) */}
      {page === "users" && currentUser.role === "admin" && (
        <>
          <div className="card">
            <h2>Добавить пользователя</h2>
            <form onSubmit={addUser}>
              <input
                type="text"
                name="name"
                placeholder="Имя"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Возраст"
                value={form.age}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Телефон"
                value={form.phone}
                onChange={handleChange}
              />
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="client">Клиент</option>
                <option value="admin">Администратор</option>
              </select>
              <button type="submit">Добавить пользователя</button>
            </form>
          </div>

          <div className="card">
            <h2>Список пользователей</h2>
            {users.map((user) => (
              <div key={user.id} className="user-item">
                <strong>{user.name}</strong>
                <br />
                {user.email}
                <br />
                {user.phone && <span> {user.phone}<br /></span>}
                <span className="user-role">{user.role || "client"}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ПОДВАЛ */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Bike Rental Moscow</h3>
            <p>Аренда велосипедов в Москве</p>
          </div>
          <div className="footer-section">
            <h4>Контакты</h4>
            <p>+7 (495) 123-45-67</p>
            <p>info@bikerental.ru</p>
          </div>
          <div className="footer-section">
            <h4>Режим работы</h4>
            <p>Ежедневно: 09:00 - 21:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Bike Rental Moscow. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;