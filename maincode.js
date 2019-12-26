var CameraImage = function()
{
    var _this = this;
    
    var m_initialized = false;
    var m_initializing = false;
    var m_destImage = null;
    var m_destWidth = 1;
    var m_destHeight = 1;
    var m_canvas = null;
    var m_context = null;
    var m_video = null;
    var m_timer = null;
    var m_stream = null;
    
    var asyncCall = function(f)
    {
        setTimeout(f, 0);
    }

    this.init = function(image, callBack, mirror)
    {
        try
        {
            if (m_initialized || m_initializing)
                throw "Already initialized or initializing";

            m_destImage = image;
            m_destWidth = image.width;
            m_destHeight = image.height;

            if (m_destWidth < 2 || m_destHeight < 2)
                throw "Image width and height must be at least 2";

            navigator.getUserMedia = ( navigator.getUserMedia ||
                                           navigator.webkitGetUserMedia ||
                                                                  navigator.mozGetUserMedia ||
                                                                                         navigator.msGetUserMedia);
            if (!navigator.getUserMedia)
                throw "navigator.getUserMedia is not available in your browser";

            m_initializing = true;

            var contraints = { audio: false, video: true };
            navigator.getUserMedia(contraints, function(stream)
            {
                m_initialized = true;
                m_initializing = false;
                asyncCall(function() { callBack(true, "Success"); });
    
                m_canvas = document.createElement("canvas");
                m_canvas.width = m_destWidth;
                m_canvas.height = m_destHeight;
                m_context = m_canvas.getContext("2d");

                if (mirror)
                {
                    m_context.translate(m_destWidth, 0);
                    m_context.scale(-1,1);
                }

                m_video = document.createElement("video");
                m_video.setAttribute("autoplay","true");
                m_video.src = window.URL.createObjectURL(stream);

                m_stream = stream;
                //document.body.appendChild(m_video);

                m_timer = setInterval(webcamGrabber, 40);
            },
            function(err)
            {
                m_initializing = false;
                asyncCall(function() { callBack(false, "Unable to get webcam video: " + err); });
            });
        }
        catch(e)
        {
            asyncCall(function() { callBack(false, e); });
        }
    }

    this.destroy = function()
    {
        m_initializing = false;
        m_initialized = false;
        try { clearInterval(m_timer); } catch (e) { }
        try { m_stream.stop(); } catch(e) { }
        m_initialized = false;
        m_initializing = false;
        m_destImage = null;
        m_destWidth = 1;
        m_destHeight = 1;
        m_canvas = null;
        m_context = null;
        m_video = null;
        m_timer = null;
        m_stream = null;
    }

    var webcamGrabber = function()
    {
        var vw = m_video.videoWidth;
        var vh = m_video.videoHeight;

        var vidAspect = vw/vh;
        var imgAspect = m_destWidth/m_destHeight;

        var h0 = Math.round(vw/imgAspect);

        if (h0 <= vh)
        {
            var diff = vh-h0;

            var d1 = Math.round(diff/2.0);

            m_context.drawImage(m_video, 0, d1, vw, vh-diff, 0, 0, m_destWidth, m_destHeight);
        }
        else 
        {
            var w0 = Math.round(vh*imgAspect);
            var diff = vw-w0;

            var d1 = Math.round(diff/2.0);

            m_context.drawImage(m_video, d1, 0, vw-diff, vh, 0, 0, m_destWidth, m_destHeight);
        }

        m_destImage.src = m_canvas.toDataURL("image/jpeg");
    }
}


maincode = function()
{
    var initialized = false;
    var initializing = false;

    var resourcesInitialized = function(_this)
    {
        console.log("Resources initialized");
        
//        var s = document.createElement("style");
//        s.innerHTML = ".vex.vex-theme-wireframe .vex-content { width: 90%; }";
//        document.head.appendChild(s);

//        vex.defaultOptions.className = 'vex-theme-wireframe';
        vex.defaultOptions.className = 'vex-theme-top';
        
        initializing = false;
        initialized = true;

        setTimeout(function() { _this.run(); }, 0);
    }

    var init = function(_this)
    {
        var resources = [ 
                        { type: "script", url: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js" },
                        { type: "script", contents: "var jQuery_2_1_0_for_vex = jQuery.noConflict(true);", url: "internal" },
                        //{ type: "link", url: "http://github.hubspot.com/vex/css/vex.css" },
                        //{ type: "link", url: "http://github.hubspot.com/vex/css/vex-theme-wireframe.css" },
                        //{ type: "script", url: "http://github.hubspot.com/vex/js/vex.js" },
                        //{ type: "script", url: "http://github.hubspot.com/vex/js/vex.dialog.js" },
                        { type: "link", url: "https://web-sight.appspot.com/vex.css" },
                        //{ type: "link", url: "https://web-sight.appspot.com/vex-theme-wireframe.css" },
                        { type: "link", url: "https://web-sight.appspot.com/vex-theme-top.css" },
                        { type: "script", url: "https://web-sight.appspot.com/vex.js" },
                        { type: "script", url: "https://web-sight.appspot.com/vex.dialog.js" },
                        //{ type: "script", url: "https://github.com/niklasvh/html2canvas/releases/download/0.4.1/html2canvas.js" },
                        //{ type: "script", url: "http://crypto-js.googlecode.com/svn/tags/3.1.2/src/core.js" },
                        //{ type: "script", url: "http://crypto-js.googlecode.com/svn/tags/3.1.2/src/md5.js" },
                      ]

        function createLoadCallback(idx)
        {
            return function()
            {
                console.log(resources[idx].url + " loaded");

                if (idx+1 == resources.length)
                    resourcesInitialized(_this);
                else
                {
                    processResource(idx+1);
                }
            }
        }

        function processResource(idx)
        {
            var obj = resources[idx];

            if (obj.type == "link")
            {
                var s = document.createElement("link");
                
                s.setAttribute("rel", "stylesheet");
                s.setAttribute("href", obj.url);
                s.onload = createLoadCallback(idx);

                console.log("Loading: " + obj.url);

                document.head.appendChild(s);
            }
            else if (obj.type == "script")
            {
                var s = document.createElement("script");
         
                if (obj.contents)
                {
                    s.innerHTML = obj.contents;
                    setTimeout(createLoadCallback(idx), 0);
                }
                else
                {
                    s.src = obj.url;
                    s.onload = createLoadCallback(idx);
                }
                document.body.appendChild(s);
            }
        }

        processResource(0); // start resource retrieval
    }

    function myBookmarkLet()
    {
        if (window.initializingBookmarklet)
            return;

        if (!window.initializedBookmarklet)
        {
            window.initializingBookmarklet = true;
            initBookmarklet();
            return;
        }

        maincode.run();
    }

    var processing = false;
    var gotClick = false;

    this.run = function()
    {
        console.log("run");

        if (initializing)
            return;
        if (!initialized)
        {
            initializing = true;
            init(this);
            return;
        }

        if (processing)
        {
            alert("Already rendering");
            return;
        }

        processing = true;

        var replaceImageWithVideo = function(clickedImg)
        {
            console.log("replaceImageWithVideo");
            var error = function(e)
            {
                console.log(e);
                vex.dialog.alert({ message: 'Error getting webcam: ' + e,
                                   callback: function() { gotClick = false; processing = false; } } );
            }

            var camImg = new CameraImage();

            camImg.init(clickedImg, function(success, message)
            {
                if (!success)
                {
                    camImg.destroy();
                    error(message);
                    return;
                }

                vex.dialog.alert({ 
                    message: 'Press OK when ready.',
                    callback: function() 
                    { 
                        camImg.destroy();
                        processing = false; 
                        gotClick = false;
                    } 
                });
            });
        }        

        var images = document.getElementsByTagName("img");

        if (images.length == 0)
        {
            alert("No images found");
        }
        else
        {
            var handled = false;
            var createHandler = function(img)
            {
                return function(evt)
                {
                    if (!handled)
                    {
                        replaceImageWithVideo(img);

                        handled = true;
                        evt.preventDefault();

                        return false;
                    }
                    return true;
                }
            }

            var createHrefHandler = function(a)
            {
                return function(evt)
                {
                    if (!handled)
                    {
                        var imgs = jQuery_2_1_0_for_vex(a).find("img");
                        if (imgs.length == 1)
                        {
                            replaceImageWithVideo(imgs[0]);

                            handled = true;
                        }
                        return false;
                    }
              
                    return true;
                }
            }

            for (var i = 0 ; i < images.length ; i++)
            {
                var img = images[i];
                var handler = createHandler(img);

                jQuery_2_1_0_for_vex(img).on("click", handler);
            }

            var hrefs = document.getElementsByTagName("a");

            for (var i = 0 ; i < hrefs.length ; i++)
            {
                var a = hrefs[i];
                var handler = createHrefHandler(a);

                jQuery_2_1_0_for_vex(a).on("click", handler);
            }

            vex.dialog.alert({ 
                message: 'Press OK and click on an image. This image will be replaced by an image from your webcam.',
                callback: function() {  } 
            });
        }
    }
}

maincode.instance = null;

maincode.run = function()
{
    if (!maincode.instance)
    {
        maincode.instance = new maincode();
        console.log("Allocated new instance");
    }

    maincode.instance.run();
}
