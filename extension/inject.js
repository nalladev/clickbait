let reportButton;

async function checkClickbait(videoId) {
  return true;
}

async function reportVideo(videoId) {
  return true;
}

function newTagElement() {
  const elm = document.createElement("span");
  elm.classList.add("clickbait");
  elm.textContent = "Clickbait";
  return elm;
}

async function handleAddedNode(node) {
  if (!node.tagName) return;
  if (
    node.tagName.toLowerCase() == "a" &&
    (node.href.includes("/watch?v=") || node.href.includes("/shorts/")) &&
    node.classList.contains("ytd-thumbnail")
  ) {
    // detects all newly added video thumbnail elements
    const videoId = new URL(node.href).searchParams.get("v");
    const isClickbait = await checkClickbait(videoId);
    if (isClickbait) node.parentNode.appendChild(newTagElement());
  } else if (
    window.location.pathname == "/watch" &&
    node.id.toLowerCase() == "movie_player"
  ) {
    // detects the watch page and youtube player container in which button is to be inserted
    document.getElementById("movie_player").appendChild(reportButton);
  }
}

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      Array.from(mutation.addedNodes).forEach((node) => handleAddedNode(node));
    }
  }
});

function waitForContentLoad() {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      const targetNode = document.getElementById("content");
      if (targetNode) {
        clearInterval(intervalId);
        resolve(targetNode);
      }
    }, 200);
  });
}

async function handleReportClick() {
  if (confirm("Report this video as spam or misleading.")) {
    await reportVideo(new URL(window.location.href).searchParams.get("v"));
  }
}

async function init() {
  const targetNode = await waitForContentLoad();

  reportButton = document.createElement("button");
  reportButton.classList.add("clickbait-btn");
  reportButton.textContent = "Report";
  reportButton.addEventListener("click", handleReportClick);

  observer.observe(targetNode, { childList: true, subtree: true });
}

init();
