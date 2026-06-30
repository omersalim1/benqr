// Supabase panelinden kopyaladığın bilgileri buraya yapıştır
const SUPABASE_URL = "https://mhzjkfrnfqgawyyovcjf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oemprZnJuZnFnYXd5eW92Y2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDYzNjUsImV4cCI6MjA5ODM4MjM2NX0.2Kkx57GyA_wcDQ3N6zPGjvpCSVlVNAuSwlo5AesvprI";

// window.supabase kullanarak isim çakışmasını önlüyoruz
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);