import { Hono } from "hono";
import daily from "./routes/daily";
import guess from "./routes/guess";
import reveal from "./routes/reveal";
import stats from "./routes/stats";

const app = new Hono<{ Bindings: Env }>();

app.route("/api/daily", daily);
app.route("/api/guess", guess);
app.route("/api/reveal", reveal);
app.route("/api/stats", stats);

export default app;
