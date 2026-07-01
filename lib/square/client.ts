import { SquareClient, SquareEnvironment } from "square";

const accessToken = process.env.SQUARE_ACCESS_TOKEN;
const squareEnvironment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";

if (!accessToken) {
  throw new Error("SQUARE_ACCESS_TOKEN is not defined");
}

export const squareClient = new SquareClient({
  token: accessToken,
  environment:
    squareEnvironment === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});
