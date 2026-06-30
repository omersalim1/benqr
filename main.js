const girisModali = document.getElementById('girisModali');
const kayitModali = document.getElementById('kayitModali');

function sifreyiDogrula(sifre) {
    if (sifre.length < 8) {
        return "Şifre en az 8 karakter olmalıdır.";
    }
    if (!/[A-Z]/.test(sifre)) {
        return "Şifre en az bir büyük harf içermelidir.";
    }
    if (!/[a-z]/.test(sifre)) {
        return "Şifre en az bir küçük harf içermelidir.";
    }
    if (!/[0-9]/.test(sifre)) {
        return "Şifre en az bir rakam içermelidir.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(sifre)) {
        return "Şifre en az bir özel karakter içermelidir.";
    }
    return true; // Tüm kontroller geçti
}
// --- MODAL AÇMA / KAPATMA FONKSİYONLARI ---
function acGirisEkrani() {
    kayitModali.classList.add('hidden');
    girisModali.classList.remove('hidden');
}
function kapatGirisEkrani() {
    girisModali.classList.add('hidden');
}

function acKayitEkrani() {
    girisModali.classList.add('hidden');
    kayitModali.classList.remove('hidden');
}
function kapatKayitEkrani() {
    kayitModali.classList.add('hidden');
}

function bildirimGoster(mesaj, tip) {
    const statusDiv = document.getElementById('registerStatus');
    statusDiv.innerText = mesaj;
    statusDiv.classList.remove('hidden', 'bg-red-500/20', 'text-red-200', 'bg-green-500/20', 'text-green-200');
    
    if (tip === 'hata') {
        statusDiv.classList.add('bg-red-500/20', 'text-red-200');
    } else {
        statusDiv.classList.add('bg-green-500/20', 'text-green-200');
    }
}
// --- SUPABASE İLE GERÇEK KAYIT OLMA MANTIĞI ---
async function kayitOlKontrol() {
    const isim = document.getElementById('kayitIsim').value.trim();
    const email = document.getElementById('kayitEmail').value.trim();
    const sifre = document.getElementById('kayitSifre').value.trim();

    // 1. Basit Boşluk Kontrolü
    if (isim === "" || email === "" || sifre === "") {
        bildirimGoster("Lütfen tüm alanları doldurun!", "hata");
        return;
    }

    // 2. Profesyonel Şifre Güvenliği Kontrolü (Min 8 karakter, en az 1 harf ve 1 sayı)
    
    const sonuc = sifreyiDogrula(sifre);

    // Eğer 'true' değilse, dönen hata mesajını göster
    if (sonuc !== true) {
        bildirimGoster(sonuc, "hata"); // Hata mesajını kullanıcıya göster
        return; // Kayıt işlemini burada kes
    }

    try {
        const { data: authData, error: authError } = await db.auth.signUp({
            email: email,
            password: sifre,
        });

        if (authError) throw authError;

        if (authData.user) {
            const { error: profileError } = await db.from('profiles').insert([
                { id: authData.user.id, isim_soyisim: isim, rol: 'user', email: email }
            ]);
            if (profileError) throw profileError;
        }

        // Başarılı bildirim
        bildirimGoster("Kayıt başarılı! E-posta kutunuzu onaylayın.", "basarili");
        
        // Formu temizle ve 2 saniye sonra girişe yönlendir
        document.getElementById('registerForm').reset();
        setTimeout(() => {
            kapatKayitEkrani();
            acGirisEkrani();
        }, 1500);

    } catch (error) {
        bildirimGoster("Hata: " + error.message, "hata");
    }
}
// --- SUPABASE İLE GERÇEK GİRİŞ YAPMA MANTIĞI ---
async function girisKontrol() {
    const email = document.getElementById('emailInput').value.trim();
    const sifre = document.getElementById('sifreInput').value.trim();

    if (email === "" || sifre === "") {
        showToast("Lütfen e-posta ve şifre girin!", "error");
        return;
    }

    try {
        // 1. Supabase üzerinden kimlik doğrulaması yap
        const { data: authData, error: authError } = await db.auth.signInWithPassword({
            email: email,
            password: sifre,
        });

        if (authError) throw authError;

        // 2. Giriş yapan kişinin adını ve rolünü (admin/user) profiles tablosundan çek
        const { data: profileData, error: profileError } = await db
            .from('profiles')
            .select('rol, isim_soyisim')
            .eq('id', authData.user.id)
            .single(); // Sadece tek bir sonuç bekle

        if (profileError) throw profileError;

        showToast(`Hoş geldiniz, ${profileData.isim_soyisim}!`, "success");

        sessionStorage.setItem('showWelcome', 'true');

        // 3. Rolüne göre doğru sayfaya yönlendir
        if (profileData.rol === 'admin' || email === "admin@qrarac.com") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "kullanici.html";
        }

    } catch (error) {
        console.error("Giriş Hatası:", error);
        showToast("Hatalı e-posta veya şifre girdiniz!", "error");
    }
}