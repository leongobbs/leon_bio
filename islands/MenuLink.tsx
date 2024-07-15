
import { useState, useEffect } from 'preact/hooks';

export default function MenuLink() {
  const [href, setHref] = useState("");

  useEffect(() => {
    const currentHref = window.location.href;
    console.log("Current Href:", currentHref); // Логируем текущий URL
    if (typeof window !== "undefined") {
      setHref(currentHref);
    } else {
      console.error("Window is undefined"); // Логируем ошибку, если window недоступен
    }
  }, []);

  const basePath = "/"; // Обновите базовый путь, если необходимо
  const link = href.endsWith("/") || href.endsWith(`${basePath}index.html`) ? `${basePath}about` : basePath;
  const linkText = href.endsWith("/") || href.endsWith(`${basePath}index.html`) ? "About" : "Home";

  return (
    <div class="text-right text-m">
      <a class="underline" href={link}>{linkText}</a>
    </div>
  );
}
