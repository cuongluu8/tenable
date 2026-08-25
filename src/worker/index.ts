import { Hono } from "hono";
import categories from "./routes/categories";
import category from "./routes/category";
import guess from "./routes/guess";
import reveal from "./routes/reveal";
import stats from "./routes/stats";

const app = new Hono<{ Bindings: Env }>();

app.route("/api/categories", categories);
app.route("/api/categories", category);
app.route("/api/guess", guess);
app.route("/api/reveal", reveal);
app.route("/api/stats", stats);

export default app;
