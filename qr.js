document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const qrId = urlParams.get('id');

    // HTML elemanlarını seç
    const yukleniyorAnimasyonu = document.getElementById('yukleniyorAnimasyonu');
    const anaKart = document.getElementById('anaKart');

    if (!qrId) {
        yukleniyorAnimasyonu.classList.add('hidden');
        document.body.innerHTML = `<div class="text-red-500 p-10 text-center">Hata: QR Kod bulunamadı!</div>`;
        return;
    }

    document.getElementById('qrKodEtiketi').innerText = "KOD: " + qrId.toUpperCase();

    try {
        // Veritabanından bilgiyi çek (Bu esnada ekranda sadece spinner döner)
        const { data, error } = await db
            .from('qrcodes')
            .select('*')
            .eq('id', qrId)
            .single();

        if (error || !data) {
            yukleniyorAnimasyonu.classList.add('hidden');
            document.body.innerHTML = `<div class="text-red-500 p-10 text-center font-bold">HATA: Bu kod sistemde tanımlı değil.</div>`;
            return;
        }

        // --- EĞER KOD BOŞSA (SAHİPSİZSE) HİÇBİR ŞEY GÖSTERMEDEN YÖNLENDİR ---
        if (data.is_active === false || data.is_active === null || !data.user_id) {
            window.location.replace("https://omersalim1.github.io/benqr/index.html");
            return; // Kodu burada kes ki aşağıdaki kart açma işlemi çalışmasın
        }
        // -------------------------------------------------------------------

        // EĞER KOD DOLUYSA: Kartı doldur
        document.getElementById('aramaPlaka').innerText = data.plaka || "Girilmedi";
        document.getElementById('isimAlani').innerText = data.surucu_isim || "İsimsiz Sürücü";
        document.getElementById('notAlani').innerText = data.acil_not || "Not girilmemiş.";

        const telAlani = document.getElementById('telefonAlani');
        if (data.numara_gizle) {
            telAlani.innerHTML = `<span class="text-gray-500 italic">Sürücü numarasını gizledi</span>`;
        } else {
            telAlani.innerHTML = `
                <a href="tel:${data.telefon}" class="text-lg font-bold text-blue-400 hover:underline flex items-center gap-2">
                    ${data.telefon || '-'}
                </a>
            `;
        }

        // Bilgiler dolduktan sonra Yükleniyor animasyonunu gizle ve Ana Kartı göster
        yukleniyorAnimasyonu.classList.add('hidden');
        anaKart.classList.remove('hidden');

    } catch (err) {
        console.error("Hata:", err);
        yukleniyorAnimasyonu.classList.add('hidden');
        document.body.innerHTML = `<div class="text-red-500 p-10 text-center font-bold">Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.</div>`;
    }
});
