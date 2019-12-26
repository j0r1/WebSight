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
