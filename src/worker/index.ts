import { Hono } from "hono";
import { enforceCircuitBreaker } from "./lib/circuitBreaker";
import categories from "./routes/categories";
import category from "./routes/category";
import giveUp from "./routes/giveUp";
import guess from "./routes/guess";
import multiplayer from "./routes/multiplayer";
import reveal from "./routes/reveal";
import stats from "./routes/stats";
import suggest from "./routes/suggest";

const app = new Hono<{ Bindings: Env }>();

// Cost guardrail, applied ahead of every route — see circuitBreaker.ts.
app.use("/api/*", enforceCircuitBreaker);

app.route("/api/categories", categories);
app.route("/api/categories", category);
app.route("/api/give-up", giveUp);
app.route("/api/guess", guess);
app.route("/api/multiplayer", multiplayer);
app.route("/api/reveal", reveal);
app.route("/api/stats", stats);
app.route("/api/suggest", suggest);

export default app;
