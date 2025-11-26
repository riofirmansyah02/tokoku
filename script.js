// ---- CUSTOM POPUP MODAL ----
function showPopup(type, message) {
  let old = document.getElementById("popupBox");
  if (old) old.remove();

  const box = document.createElement("div");
  box.id = "popupBox";
  box.style.position = "fixed";
  box.style.top = "50%";
  box.style.left = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.background = "white";
  box.style.padding = "20px 30px";
  box.style.borderRadius = "15px";
  box.style.boxShadow = "0 0 20px rgba(0,0,0,0.2)";
  box.style.zIndex = "9999";
  box.style.textAlign = "center";
  box.style.minWidth = "250px";
  box.style.fontFamily = "Arial";

  let color = type === "error" ? "#ff4d4d" : "#4CAF50";

  box.innerHTML = `
    <h3 style="margin:0 0 10px;color:${color};font-weight:700;">${type === "error" ? "Error" : "Sukses"}</h3>
    <p style="margin-bottom:15px;font-size:14px;">${message}</p>
    <button id="closePopup" style="padding:8px 20px;border:none;background:${color};color:white;border-radius:8px;cursor:pointer;">OK</button>
  `;

  document.body.appendChild(box);
  document.getElementById("closePopup").onclick = () => box.remove();
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    // ----- ELEMENT REFERENCES (AMAN DENGAN NULL CHECK) -----
    const loginScreen = document.getElementById("loginScreen");
    const registerScreen = document.getElementById("registerScreen");
    const mainHeader = document.getElementById("mainHeader");
    const categoryBar = document.getElementById("categoryBar");
    const productPage = document.getElementById("productPage");
    const productDetail = document.getElementById("productDetail");
    const cartPage = document.getElementById("cartPage");

    // Safety: abort if essential elements missing
    if (!loginScreen || !registerScreen || !mainHeader || !productPage) {
      console.error("Beberapa elemen penting tidak ditemukan di DOM. Cek index.html.");
      return;
    }

    // ----- LOGIN & REGISTER -----
    window.showLogin = function() {
      loginScreen.classList.remove("hidden");
      registerScreen.classList.add("hidden");
    };

    window.showRegister = function() {
      registerScreen.classList.remove("hidden");
      loginScreen.classList.add("hidden");
    };

    window.register = function() {
      const uEl = document.getElementById("regUser");
      const pEl = document.getElementById("regPass");
      const u = uEl ? uEl.value.trim() : "";
      const p = pEl ? pEl.value.trim() : "";
      if (!u || !p) return showPopup("error", "Lengkapi semua kolom!");
      // store as a simple key (note: not secure, for demo only)
      localStorage.setItem("user_" + u, p);
      showPopup("error", "Akun berhasil dibuat!");
      showLogin();
    };

    window.login = function() {
      const uEl = document.getElementById("loginUser");
      const pEl = document.getElementById("loginPass");
      const u = uEl ? uEl.value.trim() : "";
      const p = pEl ? pEl.value.trim() : "";

      if (!u || !p) {
        showPopup("error", "Username dan password wajib diisi!");
        return;
      }

      try {
        const saved = localStorage.getItem("user_" + u);
        console.log("DEBUG login - saved:", saved, "entered:", p);

        if (!saved) {
          // akun tidak ada
          showPopup("error", "Akun tidak ditemukan! Silakan daftar terlebih dahulu.");
          return;
        }

        if (saved !== p) {
          // password salah
          showPopup("error", "Password salah! Coba lagi.");
          return;
        }

        // Jika berhasil
        loginScreen.classList.add("hidden");
        mainHeader.classList.remove("hidden");
        categoryBar.classList.remove("hidden");
        showProducts();

      } catch (err) {
        console.error("Error saat memeriksa localStorage:", err);
        showPopup("error", "Terjadi kesalahan saat login. Buka console untuk detail.");
      }
    };

    window.logout = function() {
      // simple logout: reload page to show login again
      location.reload();
    };

    // ----- DATA PRODUK -----
    const products = [
      { id: 1, name: "Laptop Gaming", category: "laptop", img: "https://via.placeholder.com/300x200", price: 15000000 },
      { id: 2, name: "Keyboard Mechanical", category: "aksesoris", img: "https://via.placeholder.com/300x200", price: 350000 },
      { id: 3, name: "Mouse Wireless", category: "aksesoris", img: "https://via.placeholder.com/300x200", price: 250000 },
      { id: 4, name: "Laptop Office", category: "laptop", img: "https://via.placeholder.com/300x200", price: 9000000 }
    ];

    let cart = [];

    // ----- TAMPILKAN PRODUK -----
    window.showProducts = function() {
      hideAll();
      if (!productPage) return;
      productPage.innerHTML = "<h2>Produk</h2>";

      const grid = document.createElement("div");
      grid.className = "product-grid";

      products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${p.img}" alt="${escapeHtml(p.name)}">
          <h3>${escapeHtml(p.name)}</h3>
          <p>Rp ${p.price.toLocaleString()}</p>
          <button data-id="${p.id}" class="detail-btn">Detail</button>
        `;
        grid.appendChild(card);
      });

      productPage.appendChild(grid);
      productPage.classList.remove("hidden");

      // attach event listeners for detail buttons (safer than inline onclick)
      const detailBtns = grid.querySelectorAll('.detail-btn');
      detailBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number(btn.getAttribute('data-id'));
          viewDetail(id);
        });
      });
    };

    // ----- FILTER KATEGORI -----
    window.filterCategory = function(cat) {
      hideAll();
      if (!productPage) return;
      productPage.innerHTML = `<h2>Kategori: ${escapeHtml(cat)}</h2>`;
      const grid = document.createElement("div");
      grid.className = "product-grid";

      products.filter(p => cat === "all" || p.category === cat).forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${p.img}" alt="${escapeHtml(p.name)}">
          <h3>${escapeHtml(p.name)}</h3>
          <p>Rp ${p.price.toLocaleString()}</p>
          <button data-id="${p.id}" class="detail-btn">Detail</button>
        `;
        grid.appendChild(card);
      });

      productPage.appendChild(grid);
      productPage.classList.remove("hidden");

      // attach detail listeners
      const detailBtns = grid.querySelectorAll('.detail-btn');
      detailBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number(btn.getAttribute('data-id'));
          viewDetail(id);
        });
      });
    };

    // ----- DETAIL PRODUK -----
    window.viewDetail = function(id) {
      hideAll();
      const p = products.find(x => x.id === id);
      if (!p) {
        showPopup("error", "Produk tidak ditemukan.");
        showProducts();
        return;
      }
      if (!productDetail) return;
      productDetail.innerHTML = `
        <h2>${escapeHtml(p.name)}</h2>
        <img src="${p.img}" style="width:300px;border-radius:10px;" alt="${escapeHtml(p.name)}">
        <p>Harga: Rp ${p.price.toLocaleString()}</p>
        <button id="addCartBtn">Tambah ke Keranjang</button>
        <button id="backBtn" style="background:#ccc;color:black">Kembali</button>
      `;
      productDetail.classList.remove("hidden");

      // attach listeners
      const addBtn = document.getElementById('addCartBtn');
      const backBtn = document.getElementById('backBtn');
      if (addBtn) addBtn.addEventListener('click', () => addToCart(p.id));
      if (backBtn) backBtn.addEventListener('click', () => showProducts());
    };

    // ----- KERANJANG -----
    window.addToCart = function(id) {
      cart.push(id);
      showPopup("error", "Produk ditambahkan ke keranjang!");
    };

    window.showCart = function() {
      hideAll();
      if (!cartPage) return;
      cartPage.innerHTML = "<h2>Keranjang</h2>";

      if (cart.length === 0) {
        cartPage.innerHTML += "<p>Keranjang kosong.</p>";
        cartPage.classList.remove("hidden");
        return;
      }

      const list = document.createElement("div");
      cart.forEach((id, idx) => {
        const p = products.find(x => x.id === id);
        const row = document.createElement("p");
        row.textContent = `${p ? p.name : "Produk tidak ditemukan"} - Rp ${p ? p.price.toLocaleString() : "0"}`;
        list.appendChild(row);
      });
      cartPage.appendChild(list);
      cartPage.classList.remove("hidden");
    };

    // ----- UTILITY -----
    function hideAll() {
      if (productPage) productPage.classList.add("hidden");
      if (cartPage) cartPage.classList.add("hidden");
      if (productDetail) productDetail.classList.add("hidden");
    }

    function escapeHtml(text) {
      if (!text) return "";
      return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    // show initial login screen
    showLogin();

  } catch (globalErr) {
    console.error("Kesalahan fatal pada script utama:", globalErr);
    showPopup("error", "Terjadi kesalahan pada aplikasi. Cek console untuk rincian.");
  }
});
