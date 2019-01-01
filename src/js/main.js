import axios from 'axios';


///////////////////////////////
/* MODEL */
const dataController = (() => {

    class Search {
        constructor(query) {
            this.query = query;
        }
    
        async getResults() {
            try {
                const res = await axios (`https://www.themealdb.com/api/json/v1/1/filter.php?i=${this.query}`);
                
                this.resultsData = res.data.meals;
 
            } catch(error) {
                alert(error);
            }
        };

        async getDetails() {
            if (this.resultsData !== null) {
                this.id = this.resultsData.map(obj => obj.idMeal);

                try {
                    const res = await axios (`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${this.id[0]}`);

                    this.detailsData = res.data.meals;

                    for (let i = 1 ; i < this.id.length; i++) {
                        const res = await axios (`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${this.id[i]}`);

                        this.detailsData[i] = res.data.meals[0];
                    }

                } catch(error) {
                    alert(error);
                }
            }
        };
    }


    return {

        getSearch: query => {
            const searchItem = new Search(query);
            return searchItem; 
        }

    };

})();



///////////////////////////////
/* VIEW */
const uiController = (() => {

    // all quertselector shortcut 
    const elements = { /* make sure these element is already loaded in html!  */
        searchForm: document.querySelector('.search'),
        searchInput: document.querySelector('.search__input'),
        searchMain: document.querySelector('.main'),
        searchContent: document.querySelector('.content'),
        searchPage: document.querySelector('.page'),
    };
    
    // recipe markup
    const renderRecipeMarkup = data => {
        const recipe = `       
        <div class="recipe">
            <figure class="recipe__imgbox">
                <img src=${data.strMealThumb} alt=${data.strMeal} class="recipe__img">
            </figure>

            <div class="recipe__infobox">
                <div class="recipe__info-top">
                    <p class="recipe__info-name">${data.strMeal}</p>
                </div>
                <div class="recipe__info-btm">
                    <div class="recipe__info-instru">
                        <a href=${data.strSource} target="_blank">
                            <svg class="recipe__info-texticon">
                                <title>Instruction Article</title>
                                <use xlink:href="img/sprite.svg#icon-file-text"></use>
                            </svg>  
                        </a>
                        <a href=${data.strYoutube} target="_blank">
                            <svg class="recipe__info-videoicon">
                                <title>Instruction Video</title>
                                <use xlink:href="img/sprite.svg#icon-film"></use>
                            </svg>
                        </a>
                    </div>
                    <div class="recipe__info-other">
                        <div class="recipe__info-category">
                            <svg class="recipe__info-categoryicon">
                                <title>Recipe Category</title>
                                <use xlink:href="img/sprite.svg#icon-bookmark"></use>
                            </svg>
                            <span class="recipe__info-categorytxt">${data.strCategory}</span>    
                        </div>
                        <div class="recipe__info-area">
                            <svg class="recipe__info-areaicon">
                                <title>Recipe Area</title>
                                <use xlink:href="img/sprite.svg#icon-location"></use>
                            </svg>
                            <span class="recipe__info-areatxt">${data.strArea}</span> 
                        </div>
                    </div>
                </div>
            </div>
        </div> 
        `;

        elements.searchContent.insertAdjacentHTML('beforeend', recipe); 
        /* https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement */
    };

    //page button markup
    const createPageBtnMarkup = (type, page) => `
        <button class="pagebtn page__${type}" data-goto=${type === 'left' ? page - 1 : page + 1}>
            <svg class="page__${type}icon">
                <title>${type === 'left' ? 'Previous Page' : 'Next Page'}</title>
                <use xlink:href="img/sprite.svg#icon-circle-${type}"></use>
            </svg> 
        </button>
    `;
    
    //render page button
    const renderPageBtn = (page, numResults, perPageResults) => {
        const allPages = Math.ceil(numResults / perPageResults);

        let btn;
        if (page === 1 && allPages > 1) {
            // only render next page btn
            btn = createPageBtnMarkup('right', page);
        } else if (page < allPages) {
            // render next and previous page btns
            btn =  `
                ${createPageBtnMarkup('left', page)}
                ${createPageBtnMarkup('right', page)}
            `;
        } else if (page === allPages && allPages > 1) {
            // only render previous page btn
            btn = createPageBtnMarkup('left', page);
        } else if (page === 1 && allPages <= 1) {
            btn = '';
        }

        elements.searchPage.insertAdjacentHTML('afterbegin', btn);
    };

    //loding spinner markup
    const renderLoaderMarkup = () => {
        const loader = `
        <div class="loader">
            <svg class="loadericon">
                <title>Loading...</title>
                <use xlink:href="img/sprite.svg#icon-spinner2"></use>
            </svg> 
        </div>
        ` ;

        elements.searchMain.insertAdjacentHTML('afterbegin', loader);
    };

    //no result message markup
    const renderMsgMarkup = (query) => {
        const msg = `
        <div class="msg">
            <ul> 
                Sorry, no results found for <b>"${query}"</b>. Maybe you could...
                <li>Try to enter ingredient name</li>
                <li>Try different ingredient keywords</li>
            </ul>
        </div>
        `;

        elements.searchMain.insertAdjacentHTML('afterbegin', msg);
    };

    
    return {
        // get input
        getInputs: () => {
            return elements.searchInput.value;
        },
        
        // clear input field
        clearInputs: () => {
            elements.searchInput.value = '';
        },

        // render results
        renderResults: (data, page = 1, perPageResults = 10) => {
            const begin = (page - 1) * perPageResults; 
            const end = page * perPageResults;

            // insert every new search item to UI
            data.slice(begin, end).forEach(renderRecipeMarkup);

            //render page button
            renderPageBtn(page, data.length, perPageResults);
        },

        // clear result area
        clearResults: () => {
            elements.searchContent.innerHTML = '';
            elements.searchPage.innerHTML = '';
        },

        // render loading spinner
        renderLoader: () => {
            renderLoaderMarkup();  
        },

        // clear loading spinner
        clearLoader: () => {
            const loader = document.querySelector('.loader');
            if (loader) loader.parentElement.removeChild(loader);
        },


        // render no result message
        renderMsg: (query) => {
            renderMsgMarkup(query);
        },

        // clear no result message
        clearMsg: () => {
            const msg = document.querySelector('.msg');
            if (msg) msg.parentElement.removeChild(msg);
        }

    };
    
})();



///////////////////////////////
/* CONTROLLER */

//store state
const state = {};

const appController = async (dataCtrl, uiCtrl) => {
  
    //1. get input value from VIEW
    const query = uiCtrl.getInputs();

    if (query){
        //2. use the input value to create a New search object and add to state
        state.search = dataCtrl.getSearch(query);

        //3. prepare UI for search results
        uiCtrl.clearInputs(); //clear the input field
        uiCtrl.clearMsg(); // clear no result message
        uiCtrl.clearResults(); //clear the result area

        uiCtrl.renderLoader(); //render loading spinner 

        try {
            //4. get search results data from MODEL
            await state.search.getResults();
            const overview = state.search.resultsData;

            // 5. if there is no result, then render the message to VIEW
            if (overview === null) {
                uiCtrl.clearLoader(); // clear loading spinner
                uiCtrl.renderMsg(query);//render no result message
            } else {   
                await state.search.getDetails();
                const recipe = state.search.detailsData;

                //6. render results to VIEW
                uiCtrl.clearMsg(); // clear no result message
                uiCtrl.clearLoader(); // clear loading spinner

                uiCtrl.renderResults(recipe); //render result
            }

        } catch (error) {
            uiCtrl.clearLoader(); // clear loading spinner
            uiCtrl.renderMsg(query);//render no result message
        }
    }
};

const init = () => {
    // submit input
    document.querySelector('.search').addEventListener('submit', e => {
        e.preventDefault();
        appController(dataController, uiController);
    });

    // click page btn
    document.querySelector('.page').addEventListener('click', e => {
        const btn = e.target.closest('.pagebtn');
        if (btn) {
            const goTo = parseInt(btn.dataset.goto, 10);
            uiController.clearResults(); //clear the result area
            uiController.renderResults(state.search.detailsData, goTo); //render result
        }
    });
};

init();



