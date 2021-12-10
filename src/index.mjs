/**
 * THIS SOFTWARE IS PROVIDED BY CLOUDFLARE "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL CLOUDFLARE BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES  (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
 * USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

export default {
  async fetch(request, env) {
    return await handleRequest(request, env);
  }
}

async function handleRequest(request, env) {
  let id = env.COUNTER.idFromName("secure");
  let obj = env.COUNTER.get(id);
  let resp = await obj.fetch(request.url);

  return resp;
}

// Durable Object

export class Counter {
  constructor(state, env) {
    this.state = state;
    this.isblocked = false;
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    let url = new URL(request.url)
    let search = url.search || "";

    while (this.isblocked === true) {
      await new Promise((rs, rj) => setTimeout(rs, 100));
    }

    this.isblocked = true;
    // dummy http endpoint that blocks for 10 seconds before responding: https://ehrig.io/sleep/?l=10
    // query parameters are proxied as is
    let response = await fetch(`https://ehrig.io/sleep/${search}`);
    this.isblocked = false;

    return new Response(await response.text(), {
      status: 200
    });
  }
}
