export default function MenuLink() {
  // Получаем текущий URL или пустую строку, если URL недоступен
  const href = window.location?.href || "";
  // Проверяем, заканчивается ли URL на "/" или "/index.html", чтобы установить правильный линк
  const link = href.endsWith("/") || href.endsWith("/index.html") ? "/about" : "/";
  // Устанавливаем текст ссылки в зависимости от текущего URL
  const linkText = href.endsWith("/") || href.endsWith("/index.html") ? "About" : "Home";

  // Возвращаем JSX разметку
  return (
    <div class="text-right text-m">
      {/* Создаем ссылку с подчеркиванием и соответствующим URL и текстом */}
      <a class="underline" href={link}>{linkText}</a>
    </div>
  );
}
