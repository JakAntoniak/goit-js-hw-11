import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.submit-btn');
const loadMoreButton = document.querySelector('.fetch-btn');
const isButtonVisible = false;
loadMoreButton.classList.add('hidden');
let imagesLoaded = 0;
let pagesLoaded = 0;
let hits = 1;

searchButton.addEventListener('click', handleSubmit);
loadMoreButton.addEventListener('click', handleLoadMore);

async function getImages(input, page = 1, outcomes = 40) {
  const response = await axios.get('https://pixabay.com/api/', {
    params: {
      key: '33171622-0fc23e0afd878edfa0f3b2443',
      orientation: 'horizontal',
      q: input,
      image_type: 'photo',
      safesearch: 'true',
      page: page,
      per_page: outcomes,
    },
  });

  hits = response.data.totalHits;
  imagesLoaded += 40;
  return response.data;
}

function handleSubmit(event) {
  event.preventDefault();
  imagesLoaded = 0;
  getImages(searchInput.value).then(results => {
    if (results.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (imagesLoaded >= hits) {
      Notiflix.Notify.failure(
        "We're really sorry, but you've reached the end of search results."
      );
    } else {
      renderCards(results.hits);
      Notiflix.Notify.success(`Hooray! We found ${results.totalHits} images.`);
      loadMoreButton.classList.remove('hidden');
    }
  });
}

function handleLoadMore() {
  getImages(searchInput.value, pagesLoaded);
  if (imagesLoaded >= hits) {
    loadMoreButton.classList.add('hidden');
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  }
  pagesLoaded += 1;
  getImages(searchInput.value, pagesLoaded).then(results => {
    renderCards(results.hits, false);
  });
}

pagesLoaded = 1;
function renderCards(hits, clear = true) {
  if (clear) {
    gallery.innerHTML = '';
  }

  hits.forEach(elem => {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const lightBoxLink = document.createElement('a');
    lightBoxLink.setAttribute('href', elem['largeImageURL']);

    const image = document.createElement('img');
    image.src = elem['webformatURL'];
    image.alt = elem['tags'];
    image.setAttribute('loading', 'lazy');

    const info = document.createElement('div');
    info.classList.add('info');
    info.insertAdjacentHTML(
      'beforeend',
      `<div class="info-item">
      <p><b>Likes</b></p>
      <p>${elem['likes']}</p></div>
      <div class="info-item">
      <p><b>Views</b></p>
      <p>${elem['views']}</p></div>
      <div class="info-item">
      <p><b>Comments</b></p>
      <p>${elem['comments']}</p></div>
      <div class="info-item">
      <p><b>Downloads</b></p>
      <p>${elem['downloads']}</p></div>`
    );

    lightBoxLink.insertAdjacentElement('beforeend', image);
    card.insertAdjacentElement('beforeend', lightBoxLink);
    card.insertAdjacentElement('beforeend', info);
    gallery.insertAdjacentElement('beforeend', card);
  });

  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  smoothScrolling();

  function smoothScrolling() {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
  lightbox.refresh();
}

function loadMoreButtonPopup() {
  if (isButtonVisible) {
    return;
  }
  loadMoreButton.classList.remove('hidden');
}
