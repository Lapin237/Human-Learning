(function(storyContent) {

    // Create ink story from the content using inkjs
    var story = new inkjs.Story(storyContent);
    
    // delay = next_delay(delay)
    function next_delay(d) {
        switch (story.state.variablesState["speed"]) {
            case 0: 
                return d + 333.33;
            case 1:
                return d + 200.0;
            case 2:
                return 0.96 * d + 150.0;
            case 3: 
                return 0.96 * d + 90.0;
            case 4:
                return 0;
            default:
                return 0.96 * d + 150.0;
        }
    }

    // Global tags - those at the top of the ink file
    // We support:
    //  # author: Your Name
    var globalTags = story.globalTags;
    if( globalTags ) {
        for(var i=0; i<story.globalTags.length; i++) {
            var globalTag = story.globalTags[i];
            var splitTag = splitPropertyTag(globalTag);

            // author: Your Name
            if( splitTag && splitTag.property == "author" ) {
                var byline = document.querySelector('.byline');
                byline.innerHTML = "by "+splitTag.val;
            }
        }
    }

    var storyContainer = document.querySelector('#story');
    var outerScrollContainer = document.querySelector('.outerContainer');

    // page features setup
    var hasSave = loadSavePoint();
    setupButtons(hasSave);

    // 设置标题颜色
    set_header(story.state.variablesState["header"]);

    // Kick off the start of the story!
    continueStory(true);

    // Main story processing function. Each time this is called it generates
    // all the next content up as far as the next set of choices.
    function continueStory(firstTime) {

        var paragraphIndex = 0;
        var delay = 0.0;

        // Don't over-scroll past new content
        var previousBottomEdge = firstTime ? 0 : contentBottomEdgeY();

        // Generate story text - loop through available content
        while(story.canContinue) {

            // Get ink to generate the next paragraph
            var paragraphText = story.Continue();
            var tags = story.currentTags;

            // Any special tags included with this line
            var customClasses = [];
            for(var i=0; i<tags.length; i++) {
                var tag = tags[i];

                // Detect tags of the form "X: Y". Currently used for IMAGE and CLASS but could be
                // customised to be used for other things too.
                var splitTag = splitPropertyTag(tag);

                // AUDIO: src
                if( splitTag && splitTag.property == "AUDIO" ) {
                  if('audio' in this) {
                    this.audio.pause();
                    this.audio.removeAttribute('src');
                    this.audio.load();
                  }
                  this.audio = new Audio(splitTag.val);
                  this.audio.play();
                }

                // AUDIOLOOP: src
                else if( splitTag && splitTag.property == "AUDIOLOOP" ) {
                  if('audioLoop' in this) {
                    this.audioLoop.pause();
                    this.audioLoop.removeAttribute('src');
                    this.audioLoop.load();
                  }
                  this.audioLoop = new Audio(splitTag.val);
                  this.audioLoop.play();
                  this.audioLoop.loop = true;
                }

                // IMAGE: src
                if( splitTag && splitTag.property == "IMAGE" ) {
                    var imageElement = document.createElement('img');
                    imageElement.src = splitTag.val;
                    storyContainer.appendChild(imageElement);

                    showAfter(delay, imageElement);
                    delay = next_delay(delay);
                }

                // LINK: url
                else if( splitTag && splitTag.property == "LINK" ) {
                    window.location.href = splitTag.val;
                }

                // LINKOPEN: url
                else if( splitTag && splitTag.property == "LINKOPEN" ) {
                    window.open(splitTag.val);
                }

                // BACKGROUND: src
                else if( splitTag && splitTag.property == "BACKGROUND" ) {
                    outerScrollContainer.style.backgroundImage = 'url('+splitTag.val+')';
                }

                // CLASS: className
                else if( splitTag && splitTag.property == "CLASS" ) {
                    customClasses.push(splitTag.val);
                }

                // DARK: on, off, toggle
                else if( splitTag && splitTag.property == "DARK" ) {
                    if( splitTag.val == "off" ) {
                        document.body.classList.remove("dark");
                    }
                    else if( splitTag.val == "on" ) {
                        document.body.classList.add("dark");
                    }
                    else if( splitTag.val == "toggle" ) {
                        document.body.classList.toggle("dark");
                    }
                }

                // SAVE
                else if ( tag == "SAVE" ) {
                    try {
                        window.localStorage.setItem('saved_file', save(story.state));
                        document.getElementById("reload").removeAttribute("disabled");
                    } catch (e) {
                        console.warn("Couldn't save state");
                    }
                }

                // METANAME
                else if ( tag == "METANAME" ) {
                    story.state.variablesState["meta_name"] = rand6();
                }

                // METAREF
                else if ( tag == "METAREF" ) {
                    let time = story.state.variablesState["meta_time"];
                    let num = story.state.variablesState["meta_ref_num"];
                    story.state.variablesState["meta_A"] = metaref(time, num, 0);
                    story.state.variablesState["meta_B"] = metaref(time, num, 1);
                }

                // METAKEY
                else if ( tag == "METAKEY" ) {
                    story.state.variablesState["meta_key"] = meta_key;
                }

                // HEADER
                else if ( tag == "HEADER" ) {
                    set_header(story.state.variablesState["header"]);
                }

                // CLEAR - removes all existing content.
                // RESTART - clears everything and restarts the story from the beginning
                else if( tag == "CLEAR" || tag == "RESTART" ) {
                    removeAll("p");
                    removeAll("img");

                    // Comment out this line if you want to leave the header visible when clearing
                    // setVisible(".header", false);

                    if( tag == "RESTART" ) {
                        restart();
                        return;
                    }
                }
            }

            // Create paragraph element (initially hidden)
            var paragraphElement = document.createElement('p');
            paragraphElement.innerHTML = paragraphText;
            storyContainer.appendChild(paragraphElement);

            // Add any custom classes derived from ink tags
            for(var i=0; i<customClasses.length; i++)
                paragraphElement.classList.add(customClasses[i]);

            // Fade in paragraph after a short delay
            showAfter(delay, paragraphElement);
            delay = next_delay(delay);
        }

        // Create HTML choices from ink choices
        story.currentChoices.forEach(function(choice) {

            // Create paragraph with anchor element
            var choiceParagraphElement = document.createElement('p');
            choiceParagraphElement.classList.add("choice");
            choiceParagraphElement.innerHTML = `<a href='#'>${choice.text}</a>`
            storyContainer.appendChild(choiceParagraphElement);

            // Fade choice in after a short delay
            showAfter(delay, choiceParagraphElement);
            delay = next_delay(delay);

            // Click on choice
            var choiceAnchorEl = choiceParagraphElement.querySelectorAll("a")[0];
            choiceAnchorEl.addEventListener("click", function(event) {

                // Don't follow <a> link
                event.preventDefault();

                // Remove all existing choices
                removeAll(".choice");

                // Tell the story where to go next
                story.ChooseChoiceIndex(choice.index);

                // Aaand loop
                continueStory();
            });
        });

        // Extend height to fit
        // We do this manually so that removing elements and creating new ones doesn't
        // cause the height (and therefore scroll) to jump backwards temporarily.
        storyContainer.style.height = contentBottomEdgeY()+"px";

        if( !firstTime )
            scrollDown(previousBottomEdge);

    }

    function restart() {
        story.ResetState();

        setVisible(".header", true);

        continueStory(true);

        outerScrollContainer.scrollTo(0, 0);
    }

    // -----------------------------------
    // Various Helper functions
    // -----------------------------------

    // Fades in an element after a specified delay
    function showAfter(delay, el) {
        el.classList.add("hide");
        setTimeout(function() { el.classList.remove("hide") }, delay);
    }

    // Scrolls the page down, but no further than the bottom edge of what you could
    // see previously, so it doesn't go too far.
    function scrollDown(previousBottomEdge) {

        // Line up top of screen with the bottom of where the previous content ended
        var target = previousBottomEdge;

        // Can't go further than the very bottom of the page
        var limit = outerScrollContainer.scrollHeight - outerScrollContainer.clientHeight;
        if( target > limit ) target = limit;

        var start = outerScrollContainer.scrollTop;

        var dist = target - start;
        var duration = 300 + 300*dist/100;
        var startTime = null;
        function step(time) {
            if( startTime == null ) startTime = time;
            var t = (time-startTime) / duration;
            var lerp = 3*t*t - 2*t*t*t; // ease in/out
            outerScrollContainer.scrollTo(0, (1.0-lerp)*start + lerp*target);
            if( t < 1 ) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // The Y coordinate of the bottom end of all the story content, used
    // for growing the container, and deciding how far to scroll.
    function contentBottomEdgeY() {
        var bottomElement = storyContainer.lastElementChild;
        return bottomElement ? bottomElement.offsetTop + bottomElement.offsetHeight : 0;
    }

    // Remove all elements that match the given selector. Used for removing choices after
    // you've picked one, as well as for the CLEAR and RESTART tags.
    function removeAll(selector)
    {
        var allElements = storyContainer.querySelectorAll(selector);
        for(var i=0; i<allElements.length; i++) {
            var el = allElements[i];
            el.parentNode.removeChild(el);
        }
    }

    // Used for hiding and showing the header when you CLEAR or RESTART the story respectively.
    function setVisible(selector, visible)
    {
        var allElements = storyContainer.querySelectorAll(selector);
        for(var i=0; i<allElements.length; i++) {
            var el = allElements[i];
            if( !visible )
                el.classList.add("invisible");
            else
                el.classList.remove("invisible");
        }
    }

    // Helper for parsing out tags of the form:
    //  # PROPERTY: value
    // e.g. IMAGE: source path
    function splitPropertyTag(tag) {
        var propertySplitIdx = tag.indexOf(":");
        if( propertySplitIdx != null ) {
            var property = tag.substr(0, propertySplitIdx).trim();
            var val = tag.substr(propertySplitIdx+1).trim();
            return {
                property: property,
                val: val
            };
        }

        return null;
    }

    // Loads save state if exists in the browser memory
    function loadSavePoint() {

        try {
            let savedState = window.localStorage.getItem('saved_file');
            if (savedState) {
                load(story.state, savedState);
                return true;
            }
        } catch (e) {
            console.debug("Couldn't load save state");
        }
        return false;
    }

    // Used to hook up the functionality for global functionality buttons
    function setupButtons(hasSave) {

        let rewindEl = document.getElementById("rewind");
        if (rewindEl) rewindEl.addEventListener("click", function(event) {
            
            let response = "";
            response = window.prompt("彻底重置游戏。保存的进度也将被删除。请三思后行！\n输入「晚来天欲雪」的下一句以示确定，仅包括汉字。","");
            response = response.toUpperCase();
            if (response == "能饮一杯无" || response == "NEWTON") {
                if (document.body.classList.contains("dark") && response == "能饮一杯无") { 
                    alert("这里没有回头路——这命运连「重置游戏」也无法挽救。");
                } else {
                    removeAll("p");
                    removeAll("img");
                    setVisible(".header", false);
                    restart();
                    document.getElementById("reload").setAttribute("disabled", "disabled");
                    window.localStorage.setItem('saved_file', "");
                }
            } else if (response == "GAUSS") {
                story.variablesState["god_mode"] = true;
            } else if (response == "CAT") {
                story.variablesState["count"] = 9;
            } else if (response == "RAMANUJAN") {
                story.variablesState["goal"] = 1;
            }

        });

        let saveEl = document.getElementById("save");
        if (saveEl) saveEl.addEventListener("click", function(event) {
            if (document.body.classList.contains("dark")) { 
                alert("这里没有回头路——这命运连「保存进度」也无法回避。");
                return;
            } 
            window.localStorage.setItem('saved_file', save(story.state));
            document.getElementById("reload").removeAttribute("disabled");
        });

        let reloadEl = document.getElementById("reload");
        if (!hasSave) {
            reloadEl.setAttribute("disabled", "disabled");
        }
        reloadEl.addEventListener("click", function(event) {
            if (reloadEl.getAttribute("disabled"))
                return;
            if (document.body.classList.contains("dark")) { 
                alert("这里没有回头路——这命运连「加载进度」也无法逃脱。");
                return;
            } 
            let savedState = window.localStorage.getItem('saved_file');
            if (savedState) {
                removeAll("p");
                removeAll("img");
                restart();
                load(story.state, savedState);
            }
        });

        let exportEl = document.getElementById("exportButton");
        if (exportEl) exportEl.addEventListener("click", function(event) {
            navigator.clipboard.writeText(btoa("Start" + save(story.state) + "End"));    
            alert("存档已复制到剪贴板。");   
        });

        let importEl = document.getElementById("import");
        if (importEl) importEl.addEventListener("click", function(event) {
            if (document.body.classList.contains("dark")) { 
                alert("这里没有回头路——这命运连「导入存档」也无法赦免。");
                return;
            } 
            let response = "";
            response = prompt("输入要加载的存档","");
            if (response.length <= 3) return;
            let response_decode = atob(response);
            if (response_decode.startsWith("Start") && response_decode.endsWith("End")) {
                removeAll("p");
                removeAll("img");
                restart();
                load(story.state, response_decode.slice(5, -3));
            } else {
                alert("存档无效，可能不完整或已损坏。");  
            }
        });
    }

    //标题颜色
    function set_header(color) {
        if ( story.state.variablesState["header"] === -1 ) {
            story.state.variablesState["header"] = 0;
        }

        let header = document.getElementById("header");
        if (color === 0) {
            header.classList.remove("silver");
            header.classList.remove("gold");
            header.classList.remove("rainbow");
        } else if (color === 1) {
            header.classList.add("silver");
            header.classList.remove("gold");
            header.classList.remove("rainbow");
        } else if (color === 2) {
            header.classList.remove("silver");
            header.classList.add("gold");
            header.classList.remove("rainbow");
        } else if (color === 3) {
            header.classList.remove("silver");
            header.classList.remove("gold");
            header.classList.add("rainbow");
        } else if (color === -1) {
            set_header(story.state.variablesState["header"]);
        } 
    }

})(storyContent);
