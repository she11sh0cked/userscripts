// ==UserScript==
// @name        NPM - Search More
// @namespace   Violentmonkey Scripts
// @match       http*://www.npmjs.com/*
// @grant       GM_xmlhttpRequest
// @version     0.1.0
// @author      she11sh0cked
// @description Display more information about the modules on the search page
// @run-at      document-end
// ==/UserScript==

function dottedNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const cache = {};

async function getDownloads(name) {
  if (cache[name]) {
    return cache[name];
  }

  const response = await new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://api.npmjs.org/downloads/point/last-month/${name}`,
      onload: resolve,
      onerror: reject,
    });
  });

  const { downloads } = JSON.parse(response.responseText);

  cache[name] = downloads;

  return downloads;
}

function getElements() {
  return document.querySelectorAll(
    "#main > div:nth-child(2) > div > section > div:nth-child(1) > div:nth-child(1) > a > h3"
  );
}

async function main() {
  const elements = getElements();

  for (const element of elements) {
    const insertPoint = element.parentElement.parentElement.parentElement;

    if (insertPoint.querySelector("#downloads")) {
      continue;
    }

    const downloadsElement = document.createElement("span");
    downloadsElement.id = "downloads";
    downloadsElement.innerText = `Loading...`;
    downloadsElement.style.position = "absolute";
    downloadsElement.style.right = "0";
    downloadsElement.style.top = "0";

    insertPoint.appendChild(downloadsElement);
    insertPoint.style.position = "relative";

    const downloads = await getDownloads(element.innerText);
    downloadsElement.innerText = `${dottedNumber(downloads)} downloads`;
  }
}

main();
setInterval(main, 1000);
