"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
      ${showStar ? makeFavoriteStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function makeFavoriteStar(story, user){
  const favorite = user.isFavorite(story);
  let type = "regular";
  if(favorite){
    type = "solid";
  }

  return `<span class="star">
  <i class="fa-${type} fa-star"></i>
    </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function storySubmit(evt){
    evt.preventDefault();
    const author = $("#create-author").val();
    const title = $("#create-title").val();
    const url = $("#create-url").val();
    const username = currentUser.username;
    const story = {
        title,
        url,
        author,
        username
    };

    const storyResponse = await storyList.addStory(currentUser, story);
    const thisStory = generateStoryMarkup(storyResponse);
    $allStoriesList.prepend(thisStory);
}

$submitForm.on("submit", storySubmit);

async function deleteStory(evt) {
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h4>You haven't favorited any stories yet</h4>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

function putUserStoriesOnPage() {
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h4>You haven't added any stories yet</h4>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  console.log("favorited");
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($tgt.hasClass("fa-solid")) {
    await currentUser.removeFavoriteStory(story);
    $tgt.closest("i").toggleClass("fa-solid");
  } else {
    await currentUser.favoriteStory(story);
    $tgt.closest("i").toggleClass("fa-solid");
  }
}

$storiesLists.on("click", ".fa-star", toggleStoryFavorite);