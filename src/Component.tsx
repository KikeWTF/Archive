import { createSignal, For, Show, Match, Switch } from "solid-js";

import Logo from "./assets/img/logo.png";
import Background from "./assets/img/background.jpg";
import CloseBtn from "./assets/img/close.png";

import references from "./assets/references.json";

interface Reference {
  date: string;
  category: string;
  name: string;
  description: string[] | string;
  url?: string;
  image: string;
  tags?: string[];
  archive?: string;
}

export default function Component() {
  const [getSelected, setSelected] = createSignal<Reference | null>(null);

  const referencesByCategory: { [key: string]: Reference[] } = (
    references as Reference[]
  ).reduce((acc, reference) => {
    if (!acc[reference.category]) acc[reference.category] = [];
    if (Array.isArray(reference.description))
      reference.description = reference.description.join("<br/>");
    acc[reference.category].push(reference);
    acc[reference.category].sort((a, b) => b.date.localeCompare(a.date));
    return acc;
  }, {} as { [key: string]: Reference[] });

  return (
    <>
      {/* Header */}
      <header style={{ "background-image": `url(${Background})` }}>
        <div>
          {/* Navigation */}
          <nav>
            <a href=".">
              <img src={Logo} alt="Kikeflix" />
            </a>
            {/* Links */}
            <div class="links">
              <div class="link">
                <a href="/">Home</a>
              </div>
              <div class="link">
                <a href="/gallery/">Gallery</a>
              </div>
            </div>
          </nav>

          {/* Descripttion */}
          <div class="description">
            <h1 class="title">Archive</h1>
            <h2 class="subtitle">
              Welcome to my personal time machine where I compile my media
              appearances, trying to highlight my media presence and document my
              professional engagements and accomplishments.
              <br />
              <br />
              This digital repository serves as a centralized hub and a
              comprehensive collection of interviews, articles, and features
              showcasing my work and expertise.
            </h2>
          </div>
        </div>
      </header>

      {/* Main */}
      <main>
        <For
          each={Object.keys(referencesByCategory).sort((a, b) =>
            b.localeCompare(a)
          )}
          fallback={<h3>Loading...</h3>}
        >
          {(category) => (
            /* Slider */
            <section>
              <div class="title">{category}</div>
              <div class="wrappers">
                <For
                  each={referencesByCategory[category]}
                  fallback={<h3>Loading...</h3>}
                >
                  {(reference) => (
                    <div class="wrapper">
                      <div
                        class="img"
                        style={{
                          "--image": `url(./covers/${reference.image})`,
                        }}
                        onClick={() => {
                          getSelected() === reference
                            ? setSelected(null)
                            : setSelected(reference);
                          if (getSelected() !== null)
                            document
                              .getElementById("showcase")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                                inline: "nearest",
                              });
                        }}
                      />
                    </div>
                  )}
                </For>
              </div>

              {/* Showcase */}
              <Show when={getSelected()?.category === category}>
                <div
                  id="showcase"
                  class="showcase"
                  style={{
                    "--image": `url(./covers/${getSelected()?.image})`,
                  }}
                >
                  <h1>{getSelected()?.name}</h1>
                  <Show when={getSelected()?.tags}>
                    <div class="tags">
                      <For each={getSelected()?.tags}>
                        {(tag) => <div class="tag">{tag}</div>}
                      </For>
                    </div>
                  </Show>
                  <p
                    class="description"
                    innerHTML={
                      `<small>${getSelected()?.date}</small> ` +
                      (getSelected()?.description as string)
                    }
                  />
                  <button class="icon" onClick={() => setSelected(null)}>
                    <img src={CloseBtn} alt="Close" />
                  </button>
                  <div class="links">
                    <Switch
                      fallback={
                        <a class="action" href="javascript:void(0)">
                          Not found
                        </a>
                      }
                    >
                      <Match when={getSelected()?.url}>
                        <a class="action" href={getSelected()?.url}>
                          Original Link
                        </a>
                        <Show when={getSelected()?.archive}>
                          <a class="link" href={getSelected()?.archive}>
                            Archived
                          </a>
                        </Show>
                      </Match>
                      <Match when={getSelected()?.archive}>
                        <a class="action" href={getSelected()?.archive}>
                          Archived Link
                        </a>
                      </Match>
                    </Switch>
                  </div>
                </div>
              </Show>
            </section>
          )}
        </For>
      </main>
    </>
  );
}
