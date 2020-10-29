const autoCompContainer = document.querySelector(
  ".search__autocomplete-container"
);
const resultsContainer = document.querySelector(".results-container");
const input = document.querySelector(".search__input");
let lastResults;

const debounce = (fn, debounceTime) => {
  let inDebounce;
  return function (...args) {
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => fn.call(this, ...args), debounceTime);
  };
};

async function getGitHubResults(url) {
  const response = await fetch(url);
  const results = await response.json();
  return results;
}

const updateResults = debounce(async (e) => {
  if (e.target.value) {
    let searchResult = getGitHubResults(
      `https://api.github.com/search/repositories?q=${e.target.value}+in:name&sort=stars&order=desc`
    ).then((results) => {
      lastResults = results["items"];
      let fragment = new DocumentFragment();
      let numberOfResults = 5;
      if (lastResults.length == 0) {
        let element = document.createElement("div");
        element.classList.add("search__element");
        element.textContent = "No search results...";
        fragment.append(element);
      } else {
        if (lastResults.length < 5) {
          numberOfResults = lastResults.length;
        }
        for (let i = 0; i < numberOfResults; i++) {
          let element = document.createElement("div");
          element.classList.add("search__element");
          element.dataset.id = lastResults[i]["id"];
          element.textContent = lastResults[i]["name"];
          element.addEventListener("click", (e) => {
            addResult(e);
          });
          fragment.append(element);
        }
      }
      autoCompContainer.innerHTML = "";
      autoCompContainer.append(fragment);
    });
  } else {
    autoCompContainer.innerHTML = "";
  }
}, 500);

const removeResult = (e) => {
  e.target.parentElement.remove();
};

const addResult = (e) => {
  const results = document.querySelectorAll(".result");
  if (results.length === 3) {
    results[2].remove();
  }
  const searchElement = lastResults.find((element) => {
    if (element["id"] == e.target.dataset.id) {
      return true;
    }
  });

  let fragment = new DocumentFragment();
  let result = document.createElement("div");
  result.classList.add("result");
  let resultCancel = document.createElement("button");
  resultCancel.classList.add("result-cancel");
  resultCancel.addEventListener("click", (e) => {
    removeResult(e);
  });
  const text = document.createElement("pre");
  text.textContent = `Name: ${searchElement.name}\nOwner: ${searchElement.owner.login}\nStars: ${searchElement.stargazers_count}`;
  text.classList.add("result-text");
  result.append(text);
  result.append(resultCancel);
  fragment.append(result);
  resultsContainer.prepend(fragment);
};

input.addEventListener("input", updateResults);
