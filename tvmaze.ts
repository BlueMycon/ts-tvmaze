import axios, { AxiosResponse } from "axios";
import * as $ from 'jquery';

const $showsList:JQuery = $("#showsList");
const $episodesArea:JQuery = $("#episodesArea");
const $episodesList:JQuery = $("#episodesList")
const $searchForm:JQuery = $("#searchForm");
const BASE_URL:string = "https://api.tvmaze.com/"
const default_image = 'https://tinyurl.com/tv-missing'

interface showInterface {
  id: number,
  name: string,
  summary: string,
  image?: string
}
/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string):Promise<[showInterface]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response: AxiosResponse = await axios(`${BASE_URL}/search/shows?q=${term}`)
  const shows: [showInterface] = response.data.map((elem: Record<string, any>): showInterface => {
    return {
      "id": elem.show.id,
      "name": elem.show.name,
      "summary": elem.show.summary,
      "image": elem.show.image?.original || default_image
    };
  });

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: [showInterface]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image || default_image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}

$showsList.on("click", ".Show-getEpisodes", async function handleShowEpisodesButton(event: JQuery.ClickEvent): Promise<void> {
  const id: number = $(event.target).closest(".Show").data("show-id");
  await getEpisodesAndDisplay(id);
});


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term: string = $("#searchForm-term").val() as string;
  const shows: [showInterface] = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


interface episodeInterface {
  id: number,
  name: string,
  season: string,
  number: string
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<[episodeInterface]> {
  const response: AxiosResponse = await axios(`${BASE_URL}shows/${id}/episodes`)
  const episodes:[episodeInterface] = response.data.map(({ id, name, season, number }) => {
    return ({ id, name, season, number });
  });
  console.log('episodes',episodes)
  return episodes;

}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: [episodeInterface]): void {
  $episodesList.empty();

  console.log('populate episodes', episodes)
  for (let episode of episodes) {
    const $episode = $(
        `<li data-episode-id="${episode.id}">
        ${episode.name} (season ${episode.season}, number ${episode.number})
       </li>
      `);

    $episodesList.append($episode);
  }

    $episodesArea.show();

}

/** Given a show ID, get from API and display episode list
 *
 * @param {nummber} showId
 */

async function getEpisodesAndDisplay(showId: number): Promise<void> {
  const episodes: [episodeInterface] = await getEpisodesOfShow(showId);

  populateEpisodes(episodes);
}