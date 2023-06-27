//? json-server -w db.json -p 8000

// ? АПИ для запросов
const API = "http://localhost:8001/cars";
const users = "http://localhost:8001/users";
const admin = "http://localhost:8001/admin";

//? элемент куда мы добавляем карточки
const list = document.querySelector("#products-list");
//? форма с инпутами для добавления
const addForm = document.querySelector("#add-form");
const marksInp = document.querySelector("#marks");
const modelInp = document.querySelector("#model");
const yearInp = document.querySelector("#year");
const priceInp = document.querySelector("#price");
const imageInp = document.querySelector("#image");

// ? форма с инпутами для изменения
const editForm = document.querySelector("#edit-form");
const editMarksInp = document.querySelector("#edit-marks");
const editModelInp = document.querySelector("#edit-model");
const editYearInp = document.querySelector("#edit-year");
const editPriceInp = document.querySelector("#edit-price");
const editImageInp = document.querySelector("#edit-image");

// форма с инпутами для добавления
const addForm2 = document.querySelector("#add-form2");
const nameInp = document.querySelector("#name");
const phoneInp = document.querySelector("#phone");
const passwordInp = document.querySelector("#password");

const searchInput = document.querySelector("#search");
let searchVal = "";

// элементы пагинации
const paginationList = document.querySelector(".pagination-list");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
// количество продуктов на одной странице
const limit = 8;
// текущая страница
let currentPage = 1;
// общее количество страниц
let pageTotalCount = 1;

//  кнопка для скрытия и показа Admin panel
const adminPanelBtnShow = document.querySelector(".admin-panel-btn-show");
const adminPanelBtnHide = document.querySelector(".admin-panel-btn-hide");
const adminEditBtn = document.getElementsByClassName("btn-edit");
const adminDeleteBtn = document.getElementsByClassName("btn-delete");

// кнопка регистрации
const btnRegistration = document.querySelector(".btn-registr");
const registration = document.querySelector("#registr-modal");

// Достаем кнопку
const changeMode = document.querySelector(".theme");
let isDark = false;

btnRegistration.addEventListener("click", () => {
  registration.style.visibility = "visible";
});

//todo Код для показа Admin panel
addForm.style.visibility = "hidden";
addForm.style.position = "absolute";
adminPanelBtnHide.style.visibility = "hidden";
adminPanelBtnHide.style.position = "absolute";

adminPanelBtnShow.addEventListener("click", (e) => {
  addForm.style.visibility = "visible";
  addForm.style.position = "static";
  adminPanelBtnShow.style.visibility = "hidden";
  adminPanelBtnShow.style.position = "absolute";
  adminPanelBtnHide.style.visibility = "visible";
  adminPanelBtnHide.style.position = "static";
  for (let elem of adminDeleteBtn) {
    elem.style.visibility = "visible";
  }
  for (let elem of adminEditBtn) {
    elem.style.visibility = "visible";
  }
});

//todo Код для скрытия Admin panel
adminPanelBtnHide.addEventListener("click", (e) => {
  addForm.style.visibility = "hidden";
  addForm.style.position = "absolute";
  adminPanelBtnHide.style.visibility = "hidden";
  adminPanelBtnHide.style.position = "absolute";
  adminPanelBtnShow.style.visibility = "visible";
  adminPanelBtnShow.style.position = "static";
  for (let elem of adminDeleteBtn) {
    console.log(elem);
    elem.style.visibility = "hidden";
  }
  for (let elem of adminEditBtn) {
    elem.style.visibility = "hidden";
  }
});

async function getProducts() {
  // _limit это максимальное количество элементов на одной странице
  // _page чтобы элементы на определенной странице
  const res = await fetch(
    `${API}?q=${searchVal}&_limit=${limit}&_page=${currentPage}`
  ); // запрос на получение данных
  const data = await res.json(); //? расшивровка данных
  //  x-total-count общее кол-во продуктов
  const count = res.headers.get("x-total-count");
  // высчитываем общее кол-во страниц
  pageTotalCount = Math.ceil(count / limit);

  return data; // возвращаем данные
}

// функция для добавления
async function addCars(newCar) {
  await fetch(API, {
    method: "POST", // указываем метод запроса
    body: JSON.stringify(newCar), // данные которые хотим добавить
    headers: {
      // указываем тип контента чтобы сервер смог прочитать данные
      "Content-Type": "application/json",
    },
  });

  render(); // стянуть и отобразить актуальные данные
}

//  функция для удаления
async function deleteCars(id) {
  // запрос на удаление
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  // стянуть и отобразить актуальные данные
  render();
}

async function getOneProduct(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json();
  return data;
}

async function editProduct(id, newData) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(newData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  render();
}

// первоначальное отображение данных
render();

// фукция для отображения данных на странице
async function render() {
  // стягиваем актуальные данные
  const data = await getProducts();
  // очищаем list чтобы карточки не дублировались
  list.innerHTML = "";
  // перебираем полученные данные и на каждый элемент создаем карточку
  data.forEach((item) => {
    list.innerHTML += `
		<div class="card m-5" style="width: 18rem">
    <img
    src="${item.image}"
    class="card-img-top"
    alt="..."
			/>
			<div class="card-body ${isDark ? "dark-mode-cards" : ""}">
				<h5 class="card-title">${item.marks}</h5>
                <p class="card-text">Mодель: ${item.model}</p>
				<p class="card-text">Год выпуска: ${item.year}</p>
				<p class="card-text">Цена: ${item.price}$</p>
                
				<button id="${item.id}" data-bs-toggle="modal"
				data-bs-target="#exampleModal" class="btn btn-dark w-25 btn-edit hidden">Edit</button>
				<button id="${item.id}" class="btn btn-danger btn-delete hidden">Delete</button>
        </div>
        </div>
        `;
  });
  //? отрисовываем кнопки пагинации
  renderPagination();
}

//? обработчик события для добавления
addForm.addEventListener("submit", (e) => {
  // чтобы страница не перезагружалась
  e.preventDefault();

  // проверка на заполненость полей
  if (
    !marksInp.value.trim() ||
    !modelInp.value.trim() ||
    !yearInp.value.trim() ||
    !priceInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  // собираем обьект из значений инпутов
  const car = {
    marks: marksInp.value,
    model: modelInp.value,
    year: yearInp.value,
    price: priceInp.value,
    image: imageInp.value,
  };

  // добавляем обьект в db.json
  addCars(car);

  // очищаем инпуты
  marksInp.value = "";
  modelInp.value = "";
  yearInp.value = "";
  priceInp.value = "";
  imageInp.value = "";
});

//  обработчик события для удаления
document.addEventListener("click", (e) => {
  // блок if сработает только если мы нажали на элемент с классом btn-delete (на кнопку delete)
  if (e.target.classList.contains("btn-delete")) {
    deleteCars(e.target.id); // вызов функции deleteCars
  }
});

let id = null;
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    id = e.target.id;
    const product = await getOneProduct(id);

    editMarksInp.value = product.marks;
    editModelInp.value = product.model;
    editYearInp.value = product.year;
    editPriceInp.value = product.price;
    editImageInp.value = product.image;
  }
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (
    !editMarksInp.value.trim() ||
    !editModelInp.value.trim() ||
    !editYearInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  const newData = {
    marks: editMarksInp.value,
    model: editModelInp.value,
    year: editYearInp.value,
    price: editPriceInp.value,
    image: editImageInp.value,
  };

  editProduct(id, newData);
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
});

// Функция для смены темы
changeMode.addEventListener("click", async (e) => {
  document.body.classList.toggle("dark-mode");
  document.querySelector("h2").classList.toggle("text-white");
  const navbar = document.querySelector(".navbar");
  navbar.classList.toggle("bg-light");
  navbar.classList.toggle("navbar-light");
  navbar.classList.toggle("bg-dark");
  navbar.classList.toggle("navbar-dark");

  isDark = !isDark;
  render();
});
// функция для отображения кнопок пагинации
function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `
    <li class="page-item ${
      i === currentPage ? "active" : ""
    }"><button class="page-link page-number">${i}</button></li>
    `;
  }

  // чтобы кропка prev была неактивна на первой странице
  if (currentPage <= 1) {
    prev.classList.add("disabled");
  } else {
    prev.classList.remove("disabled");
  }
  // чтобы кропка next была неактивна на последней странице
  if (currentPage >= pageTotalCount) {
    next.classList.add("disabled");
  } else {
    next.classList.remove("disabled");
  }
}

async function addUser(newUser) {
  await fetch(users, {
    method: "POST",
    body: JSON.stringify(newUser),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

//===============================================================

addForm2.addEventListener("submit", (e) => {
  // чтобы страница не перезагружалась
  e.preventDefault();

  // проверка на заполненость полей
  if (
    !nameInp.value.trim() ||
    !phoneInp.value.trim() ||
    !passwordInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  // собираем обьект из значений инпутов
  const user = {
    name: nameInp.value,
    phone: phoneInp.value,
    password: passwordInp.value,
    type: "user",
  };

  // добавляем обьект в db.json
  addUser(user);

  alert("Регистрация прошла успешно!");

  // очищаем инпуты
  nameInp.value = "";
  phoneInp.value = "";
  passwordInp.value = "";
});

//===============================================================

// обработчик события чтобы перейти на следующую страницу
next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

// обработчик события чтобы перейти на предыдущую страницу
prev.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});

// обработчик события чтобы перейти на определенную страницу
document.addEventListener("click", (e) => {
  console.log(e.target.innerText);
  if (e.target.classList.contains("page-number")) {
    currentPage = +e.target.textContent;
    render();
  }
});

searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;
  currentPage = 1;
  render();
});

let btn = document.querySelector(".admin");
let pass = document.querySelector("#password1");
let phone = document.querySelector("#number1");
let inps = document.querySelector("#form-in");
let enterBtn = document.querySelector("#enter-btn");

async function getUser() {
  const res = await fetch(`${users}`);
  const data = await res.json();
  return data;
}

enterBtn.addEventListener("click", async (e) => {
  customer = await getUser();

  customer.forEach((item) => {
    if (item.phone == phone.value && item.password == pass.value) {
      console.log("user");
      if (item.type == "admin") {
        console.log("admin");
        btn.style.display = "block";
        document.querySelectorAll(".btn-edit").forEach((item) => {
          item.style.visibility = "visible";
        });
        document.querySelectorAll(".btn-delete").forEach((item) => {
          item.style.visibility = "visible";
        });
      }
    }
  });
});
