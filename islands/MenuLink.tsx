
import { useState, useEffect } from 'preact/hooks';

export default function MenuLink() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Проверяем, выполняется ли код в браузере
    if (typeof window !== "undefined") {
      console.log("Running in browser"); // Логирование при выполнении в браузере
      setIsClient(true); // Устанавливаем состояние в true, если код выполняется в браузере
    } else {
      console.log("Running on server"); // Логирование при выполнении на сервере
    }
  }, []);

  // Определяем ссылку и текст ссылки
  let link = "/";
  let linkText = "Home";

  if (isClient) {
    link = window.location.href.endsWith("/") ? "/about" : "/";
    linkText = window.location.href.endsWith("/") ? "About" : "Home";
    console.log(link)
  }

  // Возвращаем JSX разметку
  return (
    <div class="text-right text-m">
      {/* Создаем ссылку с подчеркиванием и соответствующим URL и текстом */}
      <a class="underline" href={link}>{linkText}</a>
    </div>
  );
}
