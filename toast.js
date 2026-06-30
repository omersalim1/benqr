// toast.js - Merkezi Bildirim Sistemi
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    // Toast oluştur
    const toast = document.createElement('div');
    const baseClasses = "text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform transition-all duration-300 translate-x-full opacity-0";
    
    // Tipe göre renk belirle
    const typeClasses = type === 'success' 
        ? "bg-green-600 border border-green-500" 
        : (type === 'error' ? "bg-red-600 border border-red-500" : "bg-blue-600 border border-blue-500");
    
    toast.className = `${baseClasses} ${typeClasses}`;
    toast.innerHTML = `
        <span class="font-medium">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animasyonu başlat
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 10);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}