var STUDIP = STUDIP || {};
STUDIP.PortfolioConfig = STUDIP.PortfolioConfig || {};

(function ($) {

    $(document).ready(function() {
        // warn if user may loose changes
        $('form.warn-on-unload').on('change keyup keydown', 'input, textarea, select', function (e) {
            $(this).addClass('changed-input');
        });

        $('button[type=submit]').on('click', function() {
            $('.changed-input').removeClass('changed-input');
        });

        $(window).on('beforeunload', function () {
            if ($('.changed-input').length) {
                return 'Sie haben ungespeicherte Änderungen!'.toLocaleString();
            }
        });

        $('a.confirm').bind('click', function() {
            return confirm('Sind Sie sicher?'.toLocaleString());
        })

        // add a new portfolio
        $('span.add_portfolio').bind('click', function() {
            window.location = STUDIP.URLHelper.getURL('plugins.php/portfolio/portfolio/add');
        });

        // edit the title of a portfolio
        $('span.edit_portfolio').bind('click', function() {
            // the current name of the portfolio
            var current_text = $(this).parent().find(':first-child');

            // add an edit element
            $(current_text).parent().prepend(
                $('<input class="portfolio" type="text">')
                    .val($(current_text).text())
                    .blur(function() {
                        $(this).parent().prepend($('<span>').text($(this).val()));

                        $.post(STUDIP.URLHelper.getURL('plugins.php/portfolio/portfolio/update/'
                            + $(this).parent().attr('data-id')), {
                                name:  $(this).val()
                            });
                        $(this).remove();
                    })
            );

            // focus on the new edit-element
            $(current_text).parent().find('input').focus();

            // remove the obsolete span
            $(current_text).remove();
        });

        if ($("#fileupload").length > 0){
            $('#fileupload').fileupload({
                url: $('input[name=upload_url]').val(),
                dataType: 'json',
                add: function (e, data) {
                    STUDIP.Portfolio.File.file_id += 1;
                    data.id = STUDIP.Portfolio.File.file_id;
                    STUDIP.Portfolio.File.addFile(e, data);
                },

                done: function (e, data) {
                    var files = data.result;

                    if (typeof files.errors === "object") {
                        var errorTemplateData = {
                            message: json.errors.join("\n")
                        }
                        $('#files_to_upload').before(STUDIP.Portfolio.File.errorTemplate(errorTemplateData));
                    } else {
                        _.each(files, function(file) {
                            var id = $('#files_to_upload tr:first-child').attr('data-fileid');
                            $('#files_to_upload tr[data-fileid=' + id + ']').remove();

                            var templateData = {
                                id      : file.id,
                                url     : file.url,
                                name    : file.name,
                                size    : STUDIP.Portfolio.Helpers.bytesToSize(file.size),
                                date    : file.date,
                                creator : file.creator
                            }

                            $('#uploaded_files').append(STUDIP.Portfolio.File.uploadedFileTemplate(templateData));
                        });
                    }
                },

                progress: function (e, data) {
                    var kbs = parseInt(data._progress.bitrate / 8 / 1000);
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    var id = $('#files_to_upload tr:first-child').attr('data-fileid');
                    $('#files_to_upload tr[data-fileid=' + id + '] progress').val(progress);
                    $('#files_to_upload tr[data-fileid=' + id + '] .kbs').html(kbs);
                },

                error: function(xhr, data) {
                    var id = $('#files_to_upload tr:first-child').attr('data-fileid');
                    $('#files_to_upload tr[data-fileid=' + id + '] td:nth-child(3)')
                                .html('Fehler beim Upload (' + xhr.status  + ': ' + xhr.statusText + ')');
                    $('#files_to_upload tr[data-fileid=' + id + '] td:nth-child(4)').html('');
                    $('#files_to_upload tr[data-fileid=' + id + '] td:nth-child(5)').html('');
                    $('#files_to_upload tr[data-fileid=' + id + '] td:nth-child(6)').html('');

                    $('#files_to_upload').append($('#files_to_upload tr[data-fileid=' + id + ']').remove());
                }
            });

            // load templates
            STUDIP.Portfolio.File.fileTemplate         = _.template($("script.file_template").html());
            STUDIP.Portfolio.File.uploadedFileTemplate = _.template($("script.uploaded_file_template").html());
            STUDIP.Portfolio.File.errorTemplate        = _.template($("script.error_template").html());
        }

        STUDIP.Portfolio.Permissions.initialize();
    });



    STUDIP.Portfolio = {
        studiengaenge: null,

        getTemplate: _.memoize(function(name) {
            return _.template($("script." + name).html());
        }),
    };

    STUDIP.Portfolio.Permissions = {
        initialize: function() {
            $('#permissions input[name=search]').select2({
                width: 'copy',
                minimumInputLength: 3,

                ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
                    url: STUDIP.PortfolioConfig.base_url + 'user/search',
                    dataType: 'json',
                    data: function (term, page) {
                        return {
                            term: term
                        }
                    },
                    results: function (data, page) { // parse the results into the format expected by Select2.
                        return {results: data, more: false};
                    }
                },

                formatResult: function (user) {
                    return user.picture + ' ' + user.text;
                },

                formatSelection: function (user) {
                    return user.text;
                },
            });

            $('#permissions select[name=permission]').select2({
                width: 'copy',
                minimumResultsForSearch: -1
            });

            var self = this;
            $('#add-permission').click(function(){
                self.add();
            })
        },

       add: function() {
            var self = this,
                data_user = $("#permissions input[name=search]").select2("data");
                data_perm = $('#permissions select[name=permission]').select2("data");

            if (data_user === undefined || data_user === null || data_user.id === "") {
                $('#permissions .error').hide()
                    .html('Bitte suchen Sie zuerst nach einem/r Nutzer/in, dem/der eine Berechtigung eingeräumt werden soll!'.toLocaleString())
                    .show('highlight');
                return;
            }

            var data = {
                user:       data_user.id,
                fullname:   data_user.text,
                perm:       data_perm.id,
                permission: data_perm.text
            }

            $('#permissions .error').hide();


            // store the new permission
            $.ajax(STUDIP.PortfolioConfig.base_url + 'task/add_permission/' + $('#edit-task-form').attr('data-task-user-id'), {
                method: 'POST',
                data: data,
                success: function() {
                    self.addTemplate(data);
                },

                error: function(error) {
                    $('#permissions .error').hide()
                        .html(error.statusText)
                        .show('highlight');
                }
            });


        },

        addTemplate: function(data) {
            var template = STUDIP.Portfolio.getTemplate('permission'),
                self = this;

            $('#permission_list').append(template(data)).find('div:last-child img').click(function() {
                self.delete(data.user);
                $(this).parent().parent().remove();
            });
        },

        delete: function(user) {
            $.ajax(STUDIP.PortfolioConfig.base_url + 'task/delete_permission/' + $('#edit-task-form').attr('data-task-user-id'), {
                method: 'POST',
                data: {user: user}
            });
        }
    }

    STUDIP.Portfolio.Tags = {
        update: function() {
            var tags = $("select[name^=tags]").chosen().val();

            console.log(tags);
            $.ajax(STUDIP.PortfolioConfig.base_url + 'task/update_tags/' + $('#edit-task-form').attr('data-task-user-id'), {
                method: 'POST',
                data: {tags: tags}
            })
        }
    }

    STUDIP.Portfolio.File = {
        files : {},
        maxFilesize: 0,
        fileTemplate: null,
        uploadedFileTemplate: null,
        errorTemplate: null,
        questionTemplate: null,
        file_id: 0,

        addFile: function(e, data) {
            // this is the first file for the current upload-list
            if (STUDIP.Portfolio.File.file_id == 1) {
                $('#files_to_upload').html('');
            }

            var file = data.files[0];
            STUDIP.Portfolio.File.files[data.id] = data;

            var templateData = {
                id: data.id,
                name: file.name,
                error: file.size > STUDIP.Portfolio.File.maxFilesize,
                size: STUDIP.Portfolio.Helpers.bytesToSize(file.size)
            }

            $('#files_to_upload').append(STUDIP.Portfolio.File.fileTemplate(templateData));

            if(file.type == 'image/png'
                || file.type == 'image/jpg'
                || file.type == 'image/gif'
                || file.type == 'image/jpeg') {

                var img = new Image();

                var reader = new FileReader();

                reader.onload = function (e) {
                    img.src = e.target.result;
                }

                reader.readAsDataURL(file);

                $('#files_to_upload tr:last-child td:first-child').append(img);
            }

            STUDIP.Portfolio.File.upload();
        },

        removeFile: function(id) {
            $.ajax(STUDIP.ABSOLUTE_URI_STUDIP + "plugins.php/portfolio/file"
                    + "/remove_file/" + id, {
                dataType: 'json',
                success : function() {
                    $('#uploaded_files tr[data-fileid=' + id + ']').remove();
                },
                error: function(xhr) {
                    var json = $.parseJSON(xhr.responseText);
                    alert('Fehler - Server meldet: ' + json.message);
                }
            });
        },

        upload: function() {
            // upload each file separately to allow max filesize for each file
            _.each(STUDIP.Portfolio.File.files, function (data) {
                if (data.files[0].size > 0 && data.files[0].size <= STUDIP.Portfolio.File.maxFilesize) {
                    data.submit();
                }
            });

            STUDIP.Portfolio.File.files = {};
            STUDIP.Portfolio.File.file_id = 0;
        },
    }

    STUDIP.Portfolio.Homepage = {
        tag1: null,
        tag2: null,

        init: function() {
            $('td.tags a').bind('click', function() {
                // alert($(this).attr('data-tag'));

                if ($(this).parent().hasClass('lvl2')) {
                    $(this).siblings().removeClass('selected');
                    $(this).toggleClass('selected');

                    STUDIP.Portfolio.Homepage.tag2 = $(this).hasClass('selected') ? $(this).attr('data-tag') : null;
                } else {
                    $(this).parent().siblings().find('.open').toggleClass('open', 'closed')
                            .parent().find('.lvl2').hide().find('.selected').removeClass('selected');

                    $(this).toggleClass('open', 'closed');
                    $(this).parent().find('.lvl2').toggle();

                    STUDIP.Portfolio.Homepage.tag1 = $(this).hasClass('open') ? null : $(this).attr('data-tag') ;
                    STUDIP.Portfolio.Homepage.tag2 = null;
                }

                STUDIP.Portfolio.Homepage.filter(STUDIP.Portfolio.Homepage.tag1, STUDIP.Portfolio.Homepage.tag2);
            })
        },

        filter: function(tag1, tag2) {
            // if no tag is select anymore, show everything
            if (tag1 === null && tag2 === null) {
                // show all tables
                $('table[data-tag]').show('explode', 800);

                // show all tasks
                $('table[data-tag] tr.task').show('fade');
                return;
            }

            if (tag1 !== null) {
                $('table[data-tag]').each(function() {
                    // toggle the main tag
                    if ($(this).attr('data-tag') === tag1) {
                        $(this).show('fade', 1000);
                    } else {
                        $(this).hide('explode', 800);
                    }

                    // toggle the subtags
                    if (tag2 !== null && $(this).attr('data-tag') === tag1) {
                        $(this).find('tr.task').each(function() {
                            // toggle correct tasks to show / hide - match their tags
                            if ($.inArray(tag2, $(this).data('tags')) !== -1) {
                                $(this).show('fade');
                            } else {
                                $(this).hide('fade');
                            }
                            // $(this).toggle($.inArray(tag2, $(this).data('tags')) !== -1);
                        });
                    } else if ($(this).attr('data-tag') === tag1) {
                        $(this).find('tr.task').show('fade');
                    }
                });
            }
        },
   };

    STUDIP.Portfolio.Admin = {
        num : 0,

        /**
         * add a studycourse-combo select-box to the view
         *
         * @returns {undefined}
         */
        addCombo: function (selected_elements) {
            // load the studycourse if they are not yet present
            if (STUDIP.Portfolio.studiengaenge === null) {
                $.ajax(STUDIP.URLHelper.getURL('plugins.php/portfolio/admin/set/get_studycourses'), {
                    success: function(data) {
                        STUDIP.Portfolio.studiengaenge = data;
                        STUDIP.Portfolio.Admin.doAddCombo(selected_elements);
                    }
                });
            } else {
                STUDIP.Portfolio.Admin.doAddCombo(selected_elements);
            }

        },

        doAddCombo: function(selected_elements) {
            var template = STUDIP.Portfolio.getTemplate('studycourse_template');
            var template_data = {
                num: this.num,
                options: STUDIP.Portfolio.studiengaenge
            }

            $('div.studiengang_combos').append(template(template_data));

            if (selected_elements !== undefined) {
                for (var i = 0; i < selected_elements.length; i++) {
                    $('select[data-studycourse-num=' + this.num + '] option[value=' + selected_elements[i] + ']').attr('selected', 'selected');
                }
            }

            $('div.studiengang_combos select').chosen();

            this.num++;
        },

        /**
         * remove the studygroup-combo denoted by the passed num from the view
         * @param int num
         */
        removeCombo: function(num) {
            $('div[data-studycourse-num=' + num + ']').remove();
        }
    };

    STUDIP.Portfolio.Helpers = {
        bytesToSize: function(bytes) {
            if (bytes === 0) return '0 Byte';
            var k = 1000;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        }
    };
}(jQuery));