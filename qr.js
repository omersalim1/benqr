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

        // Plakayı doldur (Boşsa "Girilmedi" yaz)
        document.getElementById('aramaPlaka').innerText = data.plaka || "Girilmedi";
        
        // İsmi doldur
        document.getElementById('isimAlani').innerText = data.surucu_isim || "İsimsiz Sürücü";
        
        // Notu doldur
        document.getElementById('notAlani').innerText = data.acil_not || "Not girilmemiş.";

        // Numara gizleme mantığı
        const telAlani = document.getElementById('telefonAlani');
        if (data.numara_gizle) {
            telAlani.innerHTML = `<span class="text-yellow-500">Numara gizli</span>`;
        } else {
            telAlani.innerText = data.telefon || "Numara yok";
        }

    } catch (err) {
        console.error("Hata:", err);
    }
});