const reportButton = document.createElement("button");
reportButton.classList.add("clickbait-btn");
reportButton.textContent = "Report";

let newVideos = [];
let waitAndFetchTimeout;

const dev = false;
const fetchUrl = dev
  ? "http://127.0.0.1:4000/reports/"
  : "https://clickbaitapi-1xma.onrender.com/reports/";

async function fetchReports() {
  try {
    const response = await fetch(fetchUrl, {
      method: "POST",
      body: JSON.stringify({ videoIds: newVideos.map((item) => item.videoId) }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function reportVideo(videoId) {
  try {
    const response = await fetch(fetchUrl + videoId, { method: "POST" });
    return response.json();
  } catch (error) {
    console.error("Error: ", error);
  }
}

reportButton.addEventListener("click", async () => {
  const videoId = new URL(window.location.href).searchParams.get("v");
  if (confirm("Report this video as spam or misleading.")) {
    await reportVideo(videoId);
  }
});

function newTagElement() {
  const element = document.createElement("span");
  element.classList.add("clickbait");
  return element;
}

async function fetchAndTAg() {
  const reports = await fetchReports();
  reports.forEach((report) => {
    const newVideosItem = newVideos.find((item) => item.videoId == report.id);
    const newElement = newTagElement();
    newVideosItem.node.parentNode.appendChild(newElement);
    if (report.count == 1) newElement.textContent = "Misleading/Spam";
    else newElement.textContent = "Misleading/Spam " + report.count;
  });
  newVideos = [];
}

function getVideoId(href) {
  const url = new URL(href);
  if (url.pathname.includes("/shorts")) {
    return url.pathname.slice(8);
  } else return url.searchParams.get("v");
}

const thumbnailObserver = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    Array.from(mutation.addedNodes).forEach(async (node) => {
      if (!node.tagName) return;
      if (
        node.tagName.toLowerCase() == "a" &&
        node.id == "thumbnail" &&
        node.classList.contains("inline-block")
      ) {
        // here gets all newly added video thumbnail elements
        const videoId = getVideoId(node.href);
        newVideos.push({ videoId, node });

        if (waitAndFetchTimeout) clearTimeout(waitAndFetchTimeout);
        waitAndFetchTimeout = setTimeout(fetchAndTAg, 300);
      }
    });
  }
});

function waitForElementLoad(type, data) {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      let element;
      if (type == "tag") element = document.getElementsByTagName(data)[0];
      else element = document.getElementById(data);
      if (element) {
        clearInterval(intervalId);
        resolve(element);
      }
    }, 200);
  });
}

const routeObserver = new MutationObserver(async () => {
  if (window.location.pathname == "/watch") {
    const playerElement = await waitForElementLoad("id", "movie_player");
    playerElement.appendChild(reportButton);
  }
});

async function init() {
  const contentNode = await waitForElementLoad("id", "content");
  thumbnailObserver.observe(contentNode, { childList: true, subtree: true });
  const titleNode = await waitForElementLoad("tag", "title");
  routeObserver.observe(titleNode, { childList: true });
}

init();
