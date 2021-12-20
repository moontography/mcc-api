import assert from "assert";
import net from "net";
import startServer from "./server";

const port = 9999;

describe("#startServer", function () {
  before(`start server`, async function () {
    await startServer(port);
  });

  it(`should have started a web server on the specified port`, async function () {
    assert.strictEqual(true, await isPortTaken(port));
  });
});

// https://gist.github.com/whatl3y/64a08d117b5856c21599b650c4dd69e6
async function isPortTaken(port: number) {
  return await new Promise((resolve, reject) => {
    const tester = net.createServer();
    tester
      .once("error", (err: any) => {
        if (err.code != "EADDRINUSE") return reject(err);
        resolve(true);
      })
      .once("listening", () =>
        tester.once("close", () => resolve(false)).close()
      )
      .listen(port);
  });
}
