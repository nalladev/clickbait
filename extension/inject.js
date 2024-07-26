function newTagElement() {
  const elm = document.createElement("span");
  elm.classList.add("clickbait");
  elm.textContent = "Clickbait";
  return elm;
}

let popupElement, reportButton;

function checkClickbait(videoId) {
  return true;
}

function onReport() {
  popupElement.style.display = "block";
}

function handleAddedNodes(nodes) {
  nodes.forEach((node) => {
    if (!node.tagName) return;
    if (
      node.tagName.toLowerCase() == "a" &&
      (node.href.includes("/watch?v=") || node.href.includes("/shorts/")) &&
      node.classList.contains("ytd-thumbnail")
    ) {
      const videoId = node.href.match(/.+\/(?:watch\?v=)?(.+)/)[1];
      const isClickbait = checkClickbait(videoId);
      if (isClickbait) node.parentNode.appendChild(newTagElement());
    } else if (
      window.location.pathname == "/watch" &&
      node.tagName.toLowerCase() == "like-button-view-model" &&
      node.clientHeight != 0
    ) {
      setTimeout(
        () =>
          document
            .querySelector(
              ".YtSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper"
            )
            .appendChild(reportButton),
        500
      );
    }
  });
}

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      handleAddedNodes(Array.from(mutation.addedNodes));
    }
  }
});

function waitForContentLoad() {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (document.getElementById("content")) {
        clearInterval(intervalId);
        resolve(document.getElementById("content"));
      }
    }, 200);
  });
}

async function init() {
  const targetNode = await waitForContentLoad();
  
  reportButton = document.createElement("button");
  reportButton.classList.add("clickbait-btn");
  reportButton.textContent = "Report";
  reportButton.addEventListener("click", onReport);

  popupElement = document.createElement("div");
  popupElement.classList.add("clickbait-popup");
  targetNode.appendChild(popupElement);

  observer.observe(targetNode, { childList: true, subtree: true });
}

init();
