// Dữ liệu tai nghe
let products = [
    {
        id: "r60i",
        defaultImg: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/s/o/soundcore_r60i_nc_1__1.png",
        db: 52,
        level: "Điếc lâm sàng",
        name: "Soundcore R60i NC (-52dB)",
        price: 650000,
        colors: [
            { name: "Trắng", hex: "#ffffff", imgUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/s/o/soundcore_r60i_nc_1__1.png" },
            { name: "Đen", hex: "#222222", imgUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/s/o/soundcore_r60i_nc_1.png" },
            { name: "Hồng", hex: "#F5A6E5", imgUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/s/o/soundcore_r60i_nc_4_.png" },
            { name: "Xanh dương", hex: "#A6AFF5", imgUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-anker-soundcore-r60i-nc-a3959-xanh_2_.png" }
        ],
        exp1: "Giọng nói bị nghẹt lại, âm lượng cực nhỏ. Cảm giác như họ đang bịt miệng hoặc nói ở phòng bên cạnh.",
        exp2: "Cách ly hoàn toàn. Người ngồi cạnh gọi tên hoặc nói chuyện bình thường bạn cũng sẽ không nghe thấy.",
        linkText: "Mua tai nghe Anker Soundcore R60i NC",
        linkUrl: "#"
    },
    {
        id: "r50i",
        defaultImg: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/t/a/tai-nghe-khong-day-anker-soundcore-r50i-nc-1_1.png",
        db: 42,
        level: "Chống ồn Tốt",
        name: "Anker Soundcore R50I NC",
        price: 440000,
        colors: [
            { name: "Trắng", hex: "#ffffff", imgUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/t/a/tai-nghe-khong-day-anker-soundcore-r50i-nc-1_1.png" },
            { name: "Đen", hex: "#222222", imgUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-anker-soundcore-r50i-nc-9.png" },
            { name: "Hồng", hex: "#F5A6E5", imgUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/a/n/anker-soundcore-r50i-nc-hong.jpg" },
            { name: "Xanh dương", hex: "#A6AFF5", imgUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/t/a/tai-nghe-khong-day-anker-soundcore-r50i-nc-4_1.png" },
            { name: "Xanh lá", hex: "#78CF8E", imgUrl: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/a/n/anker-soundcore-r50i-nc-xanh.jpg" }
        ],
        exp1: "Tiếng người nói giảm đi rất rõ rệt, chỉ còn nghe thấy âm thanh rì rầm lộn xộn, khó nghe rõ chữ.",
        exp2: "Gần như điếc. Chỉ nghe thấy nếu có ai đó hét lớn, huýt sáo hoặc vỗ tay sát bên cạnh.",
        linkText: "Mua tai nghe Anker Soundcore R50I NC",
        linkUrl: "#"
    },
    {
        id: "qcy",
        defaultImg: "https://qcyvietnam.vn/wp-content/uploads/2024/07/1712474232834604.jpg",
        db: 48,
        level: "Chống ồn Tốt",
        name: "TWS QCY AilyBuds Pro ANC HT10 (~48dB)",
        price: 649000,
        colors: [
            { name: "Trắng", hex: "#ffffff", imgUrl: "https://qcyvietnam.vn/wp-content/uploads/2024/07/1712474232834604.jpg" },
            { name: "Đen", hex: "#222222", imgUrl: "https://qcyvietnam.vn/wp-content/uploads/2024/07/1712474470486992.jpg" },
            { name: "Tím", hex: "#A964C9", imgUrl: "https://qcyvietnam.vn/wp-content/uploads/2025/08/Saebe1be0873a47b09a4001c1b8dfec378.jpg" },
            { name: "Xanh dương", hex: "#A6AFF5", imgUrl: "https://qcyvietnam.vn/wp-content/uploads/2025/08/171247450750939_bfcc853603df4b42ab40bcd1179d5a9c_master.jpg" },
            { name: "Xanh lá", hex: "#78CF8E", imgUrl: "https://qcyvietnam.vn/wp-content/uploads/2025/08/Sce7926280744481c9427d70657257337A.jpg" }
        ],
        exp1: "Tiếng người nói giảm đi rất rõ rệt, chỉ còn nghe thấy âm thanh rì rầm lộn xộn, khó nghe rõ chữ.",
        exp2: "Gần như điếc. Chỉ nghe thấy nếu có ai đó hét lớn, huýt sáo hoặc vỗ tay sát bên cạnh.",
        linkText: "Mua Tai Nghe QCY AilyBuds Pro",
        linkUrl: "#"
    },
    {
        id: "t3pro",
        defaultImg: "https://soundpeatsvietnam.com/wp-content/uploads/2025/05/1-1-1-768x768.jpg",
        db: 35,
        level: "Cách âm sương sương",
        name: "SoundPEATS T3 Pro (-35dB)",
        price: 790000,
        colors: [
            { name: "Trắng", hex: "#ffffff", imgUrl: "https://soundpeatsvietnam.com/wp-content/uploads/2025/05/1-1-1-768x768.jpg" },
            { name: "Đen", hex: "#222222", imgUrl: "https://soundpeatsvietnam.com/wp-content/uploads/2024/10/1-1-768x768.jpg" },
            { name: "Be", hex: "#f5f5dc", imgUrl: "https://soundpeatsvietnam.com/wp-content/uploads/2024/10/1-1-2-768x768.jpg" }
        ],
        exp1: "Giọng nói giảm đi khoảng một nửa, êm tai hơn. Tuy nhiên, bạn vẫn nghe rõ được nội dung họ đang nói.",
        exp2: "Vẫn lọt âm thanh. Bạn sẽ nghe thấy tiếng người nói to hoặc tiếng cười đùa lanh lảnh xen lẫn vào nhạc.",
        linkText: "Mua Tai nghe SoundPEATS T3 Pro",
        linkUrl: "#"
    },
    {
        id: "tw958",
        defaultImg: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-havit-tw958-pro_3__1.png",
        db: 30,
        level: "Cách âm sương sương",
        name: "Havit TW958 Pro (-30dB)",
        price: 460000,
        colors: [
            { name: "Trắng", hex: "#ffffff", imgUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-havit-tw958-pro_3__1.png" },
            { name: "Đen", hex: "#222222", imgUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-havit-tw958-pro_2__1.png" }
        ],
        exp1: "Giọng nói giảm đi khoảng một nửa, êm tai hơn. Tuy nhiên, bạn vẫn nghe rõ được nội dung họ đang nói.",
        exp2: "Vẫn lọt âm thanh. Bạn sẽ nghe thấy tiếng người nói to hoặc tiếng cười đùa lanh lảnh xen lẫn vào nhạc.",
        linkText: "Mua Tai nghe Havit TW958 Pro",
        linkUrl: "#"
    }
];

let sortDirection = { db: false, price: false }; 

function formatPrice(price) {
    return price.toLocaleString('vi-VN') + " đ";
}

// Hàm đổi ảnh khi click vào chấm màu
function changeImage(imgId, newUrl) {
    const imgElement = document.getElementById(imgId);
    imgElement.style.opacity = 0.5;
    setTimeout(() => {
        imgElement.src = newUrl;
        imgElement.style.opacity = 1;
    }, 100);
}

function renderTable(data) {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = ""; 
    
    data.forEach((item) => {
        let colorsHtml = item.colors.map(color => 
            `<span class="color-dot" style="background-color: ${color.hex};" title="${color.name}" onclick="changeImage('img-${item.id}', '${color.imgUrl}')"></span>`
        ).join('');

        // Thêm class 'level-col' để làm giãn cột Phân loại
        const row = `<tr>
            <td class="img-col">
                <img id="img-${item.id}" src="${item.defaultImg}" alt="${item.name}">
                <div class="color-dots">${colorsHtml}</div>
            </td>
            <td><span class="db-badge">-${item.db}dB</span></td>
            <td class="level-col"><b>${item.level}</b></td>
            <td class="model-name">${item.name}</td>
            <td class="price">${formatPrice(item.price)}</td>
            <td>${item.exp1}</td>
            <td>${item.exp2}</td>
            <td class="buy-col">
                <a href="${item.linkUrl}" class="buy-link" target="_blank" title="${item.linkText}">${item.linkText}</a>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function sortData(key) {
    sortDirection[key] = !sortDirection[key]; 
    let isAscending = sortDirection[key];

    products.sort((a, b) => {
        if (isAscending) {
            return a[key] - b[key];
        } else {
            return b[key] - a[key];
        }
    });

    renderTable(products);
}

// === Xử lý logic hiển thị và đóng tắt Modal + Bong bóng ===
document.addEventListener("DOMContentLoaded", () => {
    // Render bảng ngay khi tải trang
    renderTable(products);

    const modal = document.getElementById("welcomeModal");
    const closeBtn = document.querySelector(".close-btn");
    const bubble = document.getElementById("noteBubble");

    // Hiển thị modal khi vừa mở web
    modal.style.display = "flex";

    // Hàm đóng Modal và hiện Bubble
    function closeModal() {
        modal.style.display = "none";
        bubble.style.display = "block"; // Hiện bong bóng
    }

    // Đóng khi bấm nút X
    closeBtn.onclick = function() {
        closeModal();
    }

    // Đóng khi bấm ra ngoài vùng đen
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // Bấm vào bong bóng để mở lại Modal
    bubble.onclick = function() {
        modal.style.display = "flex";
        bubble.style.display = "none"; // Ẩn bong bóng đi
    }
});