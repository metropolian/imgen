function rebind_forms($) {
    rebind_validates($);
    rebind_utils($);
    ($('select,[data-type=tags]').length) ? rebind_select2($) : '';
    ($('[data-type=date],[date-type=time],[data-type=datetime]').length) ? rebind_pickadate($) : '';
}

function rebind_validates($) {
    // $('form input:not(input[type=radio]),form input[type=radio]:checked,select').each(function(e) { console.log('' + $(this).val()) })
    $inputs = $('form input:not(input[type=radio]),form input[type=radio]:checked,form select,form textarea');
    $inputs.each(function() { invoke_validate($(this)); })
    $inputs.popover({placement: 'top'});
    $inputs.mouseover(function(){
    });
    $inputs.focus( function() {
        $(this).popover('show');
        invoke_validate( $(this) );
    } );
    $inputs.blur( function() {
        $(this).popover('hide');
        invoke_validate( $(this) );
    } );

    function get_validate_ops(src) { // pass ops to validate.js
        try {
            return JSON.parse(atob(src));
        } catch (ex) { }
        return null;
    }

    function invoke_validate(el) {
        var validated = false;
        var type = el.attr('data-type') || el.attr('type');
        var value = el.val();
        var validate_ops = get_validate_ops(el.attr('data-validate'));
        var empty = (typeof value == 'undefined' || value === null || value === '');
        var needed = false;

        if (el.attr('required')) {
            needed = true;
            if (!empty) {
                validated = true;
            }
        } else {
            if (type == 'date' || type == 'datetime') {
                var dt = Date.parse(value);
                if (dt > 0) {
                    validated = true;
                }
            } else {
                validated = true;
            }

        }

        if (validate_ops) {
            //console.log(value);
            //console.log(validate_ops);
            var results = validate.single(value, validate_ops);
            if (results && results.length > 0) {
                needed = true;
                validated = false;
            } else {
                validated = true;
            }
        }

        if (needed) {
            console.log(el);
            if (el.attr('type') == 'radio') {
                el = el.find('input[type=radio]');
            }

            el.parents('.form-group')
                .removeClass(validated ? 'has-error' : 'has-success')
                .addClass(validated ? 'has-success' : 'has-error');
        }
    }

}

function rebind_select2($) {
    if (!$().select2) {
        $('head').append('<link rel="stylesheet" href="/modules/select2/select2.css" type="text/css" />');
        $.getScript('/modules/select2/select2.js', function() {
            rebind_select2($);
        });
    } else {
        $('select').select2();
    }

}

function rebind_pickadate($) {
    if (!$().pickadate) {
        $('head').append('<link rel="stylesheet" href="/modules/pickadate/themes/classic.css" type="text/css" />');
        $('head').append('<link rel="stylesheet" href="/modules/pickadate/themes/classic.date.css" type="text/css" />');
        $.getScript('/modules/pickadate/picker.js', function() {
            $.getScript('/modules/pickadate/picker.date.js', function() {
                rebind_pickadate($);
            });
        });
    } else {
        $('[data-type=date],[data-type=datetime]').each(function(){ $(this)
            .attr('data-value', $(this).val())
            .pickadate({
                format: 'dd mmmm yyyy',
                formatSubmit: 'yyyy/mm/dd',
                hiddenName: true
            });

        })
    }

}

function rebind_utils() {
    $("input[data-type='email']").blur( function (e) {
        var res = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i ;
        if (!res.test($(this).val())) {
            var tx = $(this).data('error');
            //alert( (tx) ? tx : 'Invalid email');
            $(this).popover({
                placement: 'bottom',
                container: 'body',
                selector: '[data-type="email"]', //Sepcify the selector here
                content: ''
            });
        }
    });

    $('.confirm').click( function() {
        $msg = $(this).attr('data-confirm');
        return confirm($msg);
    });

    $("a.submit").click( function() {
        var $dest = $(this).attr('data-form');
        var $msg = $(this).attr('data-confirm');
        var $href = $(this).attr('href');
        if ($msg != '')
            if (!confirm($msg))
                return false;
        $($dest).attr('action', $href);
        $($dest).submit();
        return false;
    });

}

(function ($) { $(function () {
    rebind_forms($);

}) })(jQuery);
