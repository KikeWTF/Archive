import {
  For,
  type Component,
  createSignal,
  Show,
  Switch,
  Match,
} from "solid-js";

import "../styles/Slider.component.css";

import references from "../assets/references.json";

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
    <main>
      <For
        each={Object.keys(referencesByCategory).sort()}
        fallback={<h3>Loading...</h3>}
      >
        {(category) => (
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
                        "--image": `url(./img/covers/${reference.image})`,
                      }}
                      onClick={() =>
                        getSelected() === reference
                          ? setSelected(null)
                          : setSelected(reference)
                      }
                    />
                  </div>
                )}
              </For>
            </div>
            <Show when={getSelected()?.category === category}>
              <div
                class="showcase"
                style={{
                  "--image": `url(./img/covers/${getSelected()?.image})`,
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
                  <img src="./img/close.png" alt="Close" />
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
  );
}
