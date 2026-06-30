document.addEventListener("DOMContentLoaded", () => {
    qrListesiniYukle();
});

// Sayfa Geçişleri
function sayfaGoster(menu) {
    const qrBolumu = document.getElementById('qrBolumu');
    const userBolumu = document.getElementById('kullaniciBolumu');
    const btnQr = document.getElementById('btnQr');
    const btnUsers = document.getElementById('btnUsers');

    if (menu === 'qr') {
        qrBolumu.classList.remove('hidden');
        userBolumu.classList.add('hidden');
        btnQr.className = "text-left bg-blue-600 text-white font-bold px-4 py-3 rounded-lg";
        btnUsers.className = "text-left text-gray-400 hover:text-white px-4 py-3 rounded-lg";
        qrListesiniYukle();
    } else {
        qrBolumu.classList.add('hidden');
        userBolumu.classList.remove('hidden');
        btnUsers.className = "text-left bg-blue-600 text-white font-bold px-4 py-3 rounded-lg";
        btnQr.className = "text-left text-gray-400 hover:text-white px-4 py-3 rounded-lg";
        kullaniciListesiniYukle();
    }
}

async function qrListesiniYukle() {
    const tablo = document.getElementById('qrTablosu');
    const { data } = await db.from('qrcodes').select('*');
    tablo.innerHTML = '';
    data.forEach(qr => {
        const sahip = qr.surucu_isim ? qr.surucu_isim : '<span class="text-gray-500 italic">Boş</span>';
        tablo.innerHTML += `
            <tr class="hover:bg-gray-700/30">
                <td class="px-6 py-4 font-mono text-blue-400">${qr.id}</td>
                <td class="px-6 py-4"><span class="${qr.is_active ? 'text-green-500' : 'text-yellow-500'} font-bold">${qr.is_active ? 'Aktif' : 'Boş'}</span></td>
                <td class="px-6 py-4 text-sm">${sahip}</td>
                <td class="px-6 py-4 flex gap-2">
                    <button onclick="qrGoster('${qr.id}')" class="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-500 transition">Görüntüle</button>
                    ${qr.is_active ? `<button onclick="qrInaktifYap('${qr.id}')" class="bg-yellow-600 px-3 py-1 rounded text-xs hover:bg-yellow-500 transition">İnaktif Yap</button>` : ''}
                    <button onclick="qrSil('${qr.id}')" class="bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-500 transition">Sil</button>
                </td>
            </tr>`;
    });
}

async function kullaniciListesiniYukle() {
    const tablo = document.getElementById('kullaniciTablosu');
    tablo.innerHTML = '<tr><td colspan="4" class="text-center py-4">Yükleniyor...</td></tr>';
    const { data } = await db.from('profiles').select('*');
    tablo.innerHTML = '';
    data.forEach(user => {
        tablo.innerHTML += `
            <tr class="hover:bg-gray-700/30">
                <td class="px-6 py-4">${user.isim_soyisim || '-'}</td>
                <td class="px-6 py-4 text-gray-400">${user.email || '-'}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs ${user.rol === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}">${user.rol || 'user'}</span></td>
                <td class="px-6 py-4"><button onclick="kullaniciSil('${user.id}')" class="text-red-500 hover:text-red-400 font-bold text-sm">Sil</button></td>
            </tr>`;
    });
}

async function qrSil(id) {
    const result = await Swal.fire({ title: 'Emin misiniz?', text: "QR kod silinecek!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet, Sil' });
    if (result.isConfirmed) { await db.from('qrcodes').delete().eq('id', id); qrListesiniYukle(); }
}

async function kullaniciSil(id) {
    const result = await Swal.fire({ title: 'Emin misiniz?', text: "Bu kullanıcı silinecek!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet, Sil' });
    if (result.isConfirmed) { await db.from('profiles').delete().eq('id', id); kullaniciListesiniYukle(); }
}

async function qrInaktifYap(id) {
    const result = await Swal.fire({ title: 'İnaktif edilsin mi?', text: "Tüm bilgiler sıfırlanacak.", icon: 'question', showCancelButton: true, confirmButtonText: 'Evet' });
    if (result.isConfirmed) {
        await db.from('qrcodes').update({ is_active: false, surucu_isim: null, telefon: null, plaka: null, acil_not: null, numara_gizle: false }).eq('id', id);
        qrListesiniYukle();
    }
}

function qrGoster(id) {
    const modal = document.getElementById('qrModal');
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = '';
    new QRCode(qrDiv, window.location.origin + "/qr.html?id=" + id);
    modal.classList.remove('hidden');
}

async function yeniQrUret() {
    const yeniID = Math.random().toString(36).substring(2, 8).toUpperCase();
    await db.from('qrcodes').insert([{ id: yeniID, is_active: false }]);
    qrListesiniYukle();
}

function cikisYap() {
    db.auth.signOut();
    window.location.href = 'index.html';
}