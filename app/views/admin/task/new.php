<?php
$infobox_content[] = array(
    'kategorie' => _('Informationen'),
    'eintrag'   => array(
        array(
            'icon' => 'icons/16/black/info.png',
            'text' => _('Nutzer/innen erhalten automatisch Zugriff auf dieses Aufgabe in diesem Aufgabenset, wenn sie in eine der ausgew�hlten Studiengangskombinationen studieren.')
        )
    )
);

$infobox = array('picture' => $infobox_picture, 'content' => $infobox_content);    
?>

<h1><?= _('Neue Aufgabe anlegen') ?></h1>
<form method="post" action="<?= $controller->url_for('admin/task/add/' . $portfolio_id) ?>">
    <label>
        <span><?= _('Titel:') ?></span><br>
        <input type="text" name="title" required="required"><br>
    </label>

    <label>
        <span><?= _('Aufgabe:') ?></span><br>
        <textarea name="content" required="required" class="add_toolbar"></textarea><br>
    </label>

    <label>
        <span><?= _('Enthalten in Aufgabensets:') ?></span><br>
        <select id="sets" name="sets[]" multiple class="chosen" data-placeholder="<?= _('W�hlen Sie Zuordnungen aus') ?>">
            <? foreach ($portfolios as $portfolio) : ?>
                <option value="<?= $portfolio->id ?>" <?= $portfolio->id == $portfolio_id ? 'selected="selected"' : '' ?>><?= htmlReady($portfolio->name) ?></option>
            <? endforeach ?>
        </select>
    </label>

    <label>
        <span><?= _('Schlagworte:') ?></span><br>
        <select id="tags" name="tags[]" multiple data-placeholder="<?= _('F�gen Sie Schlagworte hinzu') ?>">
            <? foreach ($tags as $tag) : ?>
            <option><?= htmlReady($tag->tag) ?></option>
            <? endforeach ?>
        </select>
    </label>        

    <label>
        <input type="checkbox" name="allow_text" checked="checked">
        <?= _('Texteingabe erlauben?') ?>
    </label>

    <label>
        <input type="checkbox" name="allow_files" checked="checked">
        <?= _('Dateiupload erlauben?') ?>
    </label>

    <div style="text-align: center">
        <div class="button-group">
            <?= Studip\Button::createAccept(_('Aufgabe erstellen')) ?>
            <?= Studip\LinkButton::createCancel(_('Abbrechen'), $controller->url_for('admin/task/index/' . $portfolio_id)) ?>
        </div>
    </div>
</form>

<script>
    jQuery(document).ready(function() {
        jQuery('#sets').chosen();
        jQuery('#tags').chosen({
            create_option: true,
            skip_no_results: true,
            persistent_create_option: true,
            create_option_text: 'Schlagwort erstellen'.toLocaleString()
        });
    });
</script>