jQuery(document).ready(function()
{
    $('div#try_plugin_popover .mc-subscribe-submit-email :submit').click(function(event) {
        submit_email('p');
        return false;
    });


    $('div#try_popover .mc-subscribe-submit-email :submit').click(function(event) {
        submit_email('t');
/*        $.post('/subscribe.php', {
            email: $('#subscriber_email').val(),
            type: "trial"
        }, function(response) {
            resp = $.parseJSON(response);
        })
*/
        return false;
    });

    
    $('div#origami_popover .mc-subscribe-submit-email :submit').click(function(event) {
        submit_email('o');
/*        $.post('/subscribe.php', {
            email: $('#subscriber_email').val(),
            type: "origami"
        }, function(response) {
            resp = $.parseJSON(response);
        })
        */
        return false;
    });

    
    $('.mc-subscribe :submit').click(function(event) {
        $.post('/subscribe.php', {
            email: $('#subscriber_email').val()
        }, function(response) {
            resp = $.parseJSON(response);
            if(resp.result == 1) {
                $('#subscriber_email').val('Thank you for subscribing!').attr('disabled', true);
                $('#frm-subscribeForm :submit').fadeOut(400);
            } else {
                $('#subscriber_email').val('Please try again later!');
            }
        })
        return false;
    });
    
    
    $('.mc-subscribe').submit(function(event) {
        $.post('/subscribe.php', {
            email: $('#mce-EMAIL').val()
        }, function(response) {
            resp = $.parseJSON(response);
            if(resp.result == 1) {
                $('#subscriber_email').val('Thank you for subscribing!').attr('disabled', true);
                $('#frm-subscribeForm :submit').fadeOut(400);
            } else {
                $('#subscriber_email').val('Please try again later!');
            }
        })
        return false;
    })
    
    
    $('form.telekinesis_subscribe').submit(function(event) {
        var email = $(this).children("input[type=email]").val();
        $("form.telekinesis_subscribe input[type=email]").val(email);
        submit_email('telekinesis');
        return false;
    })
    
});