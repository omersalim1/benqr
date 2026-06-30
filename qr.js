document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const qrId = urlParams.get('id');

    if (!qrId) {
        document.body.innerHTML = `<div class="text-red-500 p-10 text-center">Hata: QR Kod bulunamadı!</div>`;
        return;
    }

    document.getElementById('qrKodEtiketi').innerText = "KOD: " + qrId.toUpperCase();

    try {
        const { data, error } = await db
            .from('qrcodes')
            .select('*')
            .eq('id', qrId)
            .single();

        if (error || !data) {
            document.getElementById('aramaPlaka').innerText = "HATA";
            return;
        }

        // --- EN GARANTİ KONTROL: EĞER AKTİF DEĞİLSE, NULL İSE VEYA USER_ID YOKSA ANASAYFAYA AT ---
        if (data.is_active === false || data.is_active === null || !data.user_id) {
            console.log("Boş QR tespit edildi, ana sayfaya yönlendiriliyor...");
            window.location.replace("https://omersalim1.github.io/benqr/index.html");
            return; // Kodun aşağı doğru devam edip eski kartı basmasını engeller
        }
        // ----------------------------------------------------------------------------

        // Plakayı doldur (Boşsa "Girilmedi" yaz)
        document.getElementById('aramaPlaka').innerText = data.plaka || "Girilmedi";
        
        // İsmi doldur
        document.getElementById('isimAlani').innerText = data.surucu_isim || "İsimsiz Sürücü";
        
        // Notu doldur
        document.getElementById('notAlani').innerText = data.acil_not || "Not girilmemiş.";

        // Numara gizleme mantığı
        const telAlani = document.getElementById('telefonAlani');
        if (data.numara_gizle) {
            telAlani.innerHTML = `<span class="text-gray-500 italic">Sürücü numarasını gizledi</span>`;
        } else {
            telAlani.innerHTML = `
                <p class="text-xs text-gray-400 mb-1">Telefon</p>
                <a href="tel:${data.telefon}" class="text-lg font-bold text-blue-400 hover:underline flex items-center gap-2">
                    ${data.telefon || '-'}
                </a>
            `;
        }

    } catch (error) {
        console.error("QR veri yükleme hatası:", error);
    }
});
