// Sayfa yüklendiğinde aktif kodları getir
document.addEventListener("DOMContentLoaded", async () => {

    if (sessionStorage.getItem('showWelcome') === 'true') {
        
        // 2. Kullanıcıyı getir
        const { data: { user } } = await db.auth.getUser();
        if (user) {
            const { data } = await db.from('profiles').select('isim_soyisim').eq('id', user.id).single();
            if (data) {
                // 3. Bildirimi göster
                showToast(`Hoş geldiniz, ${data.isim_soyisim}!`, 'success');
            }
        }
        
        // 4. BİLETİ SİL (Burası en önemlisi, bir daha çıkmasını engeller)
        sessionStorage.removeItem('showWelcome');
    }
    await aktifQrKodlariGetir();
});

// Form Gönderimi (QR Ekleme ve Bilgi Kaydetme)
document.getElementById('birlesikForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const qrId = document.getElementById('qrIdInput').value.trim().toUpperCase();
    
    // Supabase Verilerini Hazırla
    const guncelVeriler = {
        surucu_isim: document.getElementById('surucuIsim').value,
        telefon: document.getElementById('surucuTel').value,
        plaka: document.getElementById('aracPlaka').value.toUpperCase(),
        acil_not: document.getElementById('acilNot').value,
        numara_gizle: document.getElementById('numaraGizle').checked,
        is_active: true // Kodu aktifleştir
    };

    try {
        const { data: { user } } = await db.auth.getUser();
        if (!user) { showToast("Oturumunuz kapalı, lütfen tekrar giriş yapın!", "error"); return; }

        // 1. Kodun varlığını ve boş (is_active: false) olduğunu kontrol et
        const { data: qrKontrol, error: kontrolError } = await db
            .from('qrcodes')
            .select('*')
            .eq('id', qrId)
            .single();

        if (kontrolError || !qrKontrol) {
            showToast("Bu kod sistemde tanımlı değil!", "error");
            return;
        }

        if (qrKontrol.is_active) {
            showToast("Bu kod zaten başkası tarafından kullanılıyor!", "error");
            return;
        }

        // 2. Kodu güncelle ve kullanıcıya ata
        const { error: updateError } = await db
            .from('qrcodes')
            .update({
                ...guncelVeriler,
                user_id: user.id
            })
            .eq('id', qrId);

        if (updateError) throw updateError;

        showToast("Başarılı! QR kodunuz aracınızla eşleştirildi.", "success");
        
        document.getElementById('birlesikForm').reset();
        await aktifQrKodlariGetir();

    } catch (error) {
        console.error(error);
        showToast("Hata: " + error.message, "error");
    }
});

// Listeyi Yenileme Fonksiyonu
async function aktifQrKodlariGetir() {
    const listeDiv = document.getElementById('aktifQrListesi');
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    const { data, error } = await db
        .from('qrcodes')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        listeDiv.innerHTML = '<p class="text-red-500">Veri çekilemedi.</p>';
        return;
    }

    listeDiv.innerHTML = ''; 
    if (data.length === 0) {
        listeDiv.innerHTML = '<p class="text-gray-500 italic">Henüz eklenmiş bir QR kodunuz bulunmuyor.</p>';
        return;
    }

    data.forEach(qr => {
        listeDiv.innerHTML += `
            <div class="bg-gray-900 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                <div>
                    <span class="font-mono text-blue-400 font-bold">${qr.id}</span>
                </div>
                <button onclick="duzenle('${qr.id}')" class="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Düzenle</button>
                <button onclick="silQr('${qr.id}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition">Sil</button>
                <a href="qr.html?id=${qr.id}" target="_blank" class="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded">
                    Önizle
                </a>
            </div>
        `;
    });
}

// ... Mevcut kodlarının arasına / sonuna ekle ...

// 1. DÜZENLEME MODALINI AÇAN FONKSİYON
async function duzenle(qrId) {
    // Önce o QR'ın verilerini çek
    const { data, error } = await db.from('qrcodes').select('*').eq('id', qrId).single();
    
    if (error) { showToast("Veri alınamadı!", "error"); return; }

    // Formu doldur
    document.getElementById('edit_qrId').value = data.id;
    document.getElementById('edit_surucuIsim').value = data.surucu_isim || '';
    document.getElementById('edit_surucuTel').value = data.telefon || '';
    document.getElementById('edit_aracPlaka').value = data.plaka || '';
    document.getElementById('edit_acilNot').value = data.acil_not || '';
    document.getElementById('edit_numaraGizle').checked = data.numara_gizle || false;

    // Modalı göster
    document.getElementById('editModal').classList.remove('hidden');
}

// 2. DÜZENLEMEYİ KAYDEDEN FONKSİYON
async function kaydetDuzenleme(e) {
    e.preventDefault();
    const qrId = document.getElementById('edit_qrId').value;

    const guncelVeriler = {
        surucu_isim: document.getElementById('edit_surucuIsim').value,
        telefon: document.getElementById('edit_surucuTel').value,
        plaka: document.getElementById('edit_aracPlaka').value.toUpperCase(),
        acil_not: document.getElementById('edit_acilNot').value,
        numara_gizle: document.getElementById('edit_numaraGizle').checked
    };

    const { error } = await db.from('qrcodes').update(guncelVeriler).eq('id', qrId);

    if (error) {
        showToast("Güncelleme başarısız: " + error.message, "error");
    } else {
        showToast("Başarıyla güncellendi!", "success");
        document.getElementById('editModal').classList.add('hidden');
        await aktifQrKodlariGetir(); // Listeyi yenile
    }
}

async function silQr(qrId) {
    // Kullanıcıya onay soralım
    if (!confirm("Bu QR kodu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
        return;
    }

    try {
        const { error } = await db
            .from('qrcodes')
            .delete()
            .eq('id', qrId);

        if (error) throw error;

        showToast("QR kod başarıyla silindi.", "success");
        
        // Listeyi güncelleyin
        await aktifQrKodlariGetir();

    } catch (error) {
        console.error(error);
        showToast("Hata: " + error.message, "error");
    }
}

// --- QR KAMERA OKUMA İŞLEMLERİ (MOBİL UYUMLU) ---

let html5QrCode = null;

function kameraAc() {
    const modal = document.getElementById('kameraModal');
    const loadingText = document.getElementById('kameraYukleniyorText');
    modal.classList.remove('hidden');
    
    if (loadingText) loadingText.style.display = 'block';

    // Kamerayı başlatmak için Html5Qrcode sınıfını kullanıyoruz
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("qr-reader");
    }

    // Mobilde "arka kamerayı" (environment) kullanmaya zorluyoruz
    html5QrCode.start(
        { facingMode: "environment" }, 
        {
            fps: 10,    // Saniyede 10 kare tara
            qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanFailure
    ).then(() => {
        // Kamera başarıyla açıldıysa yükleniyor yazısını gizle
        if (loadingText) loadingText.style.display = 'none';
    }).catch((err) => {
        console.error("Kamera başlatılamadı:", err);
        alert("Kamera açılamadı. Lütfen telefonunuzun tarayıcı ayarlarından (Chrome/Safari) siteye kamera izni verdiğinizden emin olun.");
        kameraKapat();
    });
}

function onScanSuccess(decodedText, decodedResult) {
    let qrId = decodedText;
    
    // Link içinden sadece ID'yi ayıkla
    if (decodedText.includes('?id=')) {
        try {
            const url = new URL(decodedText);
            qrId = url.searchParams.get("id");
        } catch(e) {
            qrId = decodedText.split('?id=')[1];
        }
    }

    if (qrId) {
        document.getElementById('qrIdInput').value = qrId.toUpperCase();
        showToast("QR Kod başarıyla okundu!", "success");
        kameraKapat(); // Okuma başarılı olunca kamerayı kapat
    }
}

function onScanFailure(error) {
    // Tarayıcı kodu görene kadar sürekli bu hatayı fırlatır, sessizce geçiyoruz.
}

function kameraKapat() {
    document.getElementById('kameraModal').classList.add('hidden');
    
    // Kamera açıksa durdur ve hafızadan temizle
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch((err) => {
            console.error("Kamera durdurulurken hata:", err);
        });
    }
}
