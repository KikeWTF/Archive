import type { Component } from "solid-js";

import "../styles/Header.component.css";

export default function Component() {
  return (
    <header>
      <div>
        <nav>
          <a href=".">
            <img src="./img/logo.png" alt="Kikeflix" />
          </a>
          <div class="link">
            <a href="/">Home</a>
          </div>
          <div class="link">
            <a href="/gallery/">Gallery</a>
          </div>
        </nav>
        <div>
          <h1 class="title">Archive</h1>
          <h2 class="subtitle">
            Welcome to my personal time machine where I compile my media
            appearances, trying to highlight my media presence and document my
            professional engagements and accomplishments. This difital
            repository serves as a centralized hub and a comprehensive
            collection of interviews, articles, and features showcasing my work
            and expertise.
          </h2>
        </div>
      </div>
    </header>
  );
}
