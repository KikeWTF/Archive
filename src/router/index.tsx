import { Route, Routes, Router } from "@solidjs/router";
import type { Component } from "solid-js";

import Browse from "./pages/Browse";

export default function Component() {
  return (
    <Router>
      <Routes>
        <Route path="/" component={Browse} />
      </Routes>
    </Router>
  );
}
