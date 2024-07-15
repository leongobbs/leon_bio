import { useState, useEffect } from 'preact/hooks';

export default function MenuLink() {
  // Создаем состояние для хранения текущего URL
  const [href, setHref] = useState("");

  // Хук useEffect выполняется после монтирования компонента
  useEffect(() => {
    // Проверяем, выполняется ли код в браузере
    if (typeof window !== "undefined") {
      // Обновляем состояние с текущим URL
      setHref(window.location.href);
    }
  }, []);

  // Определяем ссылку и текст ссылки в зависимости от текущего URL
  const link = href.endsWith("/") || href.endsWith("/index.html") ? "/about" : "/";
  const linkText = href.endsWith("/") || href.endsWith("/index.html") ? "About" : "Home";

  // Возвращаем JSX разметку
  return (
    <div class="text-right text-m">
      {/* Создаем ссылку с подчеркиванием и соответствующим URL и текстом */}
      <a class="underline" href={link}>{linkText}</a>
    </div>
  );
}
