<?php
$infobox_content[] = array(
    'kategorie' => _('Informationen'),
    'eintrag'   => array(
        array(
            'icon' => 'icons/16/black/info.png',
            'text' => _('Nutzer erhalten automatisch Zugriff auf dieses Aufgabenset, wenn sie in eine der ausgew�hlten Studiengangskombinationen studieren.')
        )
    )
);

$infobox = array('picture' => $infobox_picture, 'content' => $infobox_content);

$path = array(
    array(
        'portfolio/index',
        _('�bersicht')
    ),
    array(
        'task/index/' . $portfolio->id,
        $portfolio->name
    ),
    $task->title
);
?>

<?= $this->render_partial('task/js_templates.php') ?>
<?= $this->render_partial('file/js_templates.php') ?>

<h1><?= _('Aufgabe bearbeiten') ?></h1>
<form method="post" action="<?= $controller->url_for('task/update/' . $portfolio_id .'/'. $task->id) ?>">
    <!-- Task -->
    <label <?= ($perms['edit_task'] ? '' : 'class="mark"') ?>>
        <span><?= _('Titel:') ?></span><br>
        <? if ($perms['edit_task']): ?>
        <input type="text" name="title" required="required" value="<?= htmlReady($task->title) ?>"><br>
        <? else : ?>
        <?= htmlReady($task->title) ?>
        <? endif ?>
    </label>

    <label <?= ($perms['edit_task'] ? '' : 'class="mark"') ?>>
        <span><?= _('Aufgabenbeschreibung:') ?></span><br>
        <? if ($perms['edit_task']): ?>
        <textarea name="content" required="required" class="add_toolbar"><?= htmlReady($task->content) ?></textarea><br>
        <? else : ?>
        <?= formatReady($task->content) ?>
        <? endif ?>
    </label>

    <!-- Settings -->
    <? if ($perms['edit_settings']) : ?>
    <label>
        <span><?= _('Zugeordnete Portfolios:') ?></span><br>
        <select id="sets" name="sets[]" required multiple class="chosen" data-placeholder="<?= _('W�hlen Sie Zuordnungen aus') ?>">
            <? foreach ($portfolios as $portfolio) : ?>
                <option <?= $portfolio->global ? 'disabled' : '' ?> value="<?= $portfolio->id ?>"
                        <?= in_array($portfolio->id, $task_portfolios) !== false ? 'selected="selected"' : '' ?>>
                    <?= htmlReady($portfolio->name) ?>
                </option>
            <? endforeach ?>
        </select>
        <?= tooltipIcon('Neue Portfolios k�nnen Sie auf der �bersichtsseite erstellen.') ?>
    </label>

    <label>
        <span><?= _('Tags:') ?></span><br>
        <select id="tags" name="tags[]" multiple data-placeholder="<?= _('F�gen Sie Tags hinzu') ?>">
            <? foreach ($task->tags as $tag) : ?>
                <option value="<?= htmlReady($tag->tag) ?>" selected="selected" <?= $tag->user_id == 'global' ? 'disabled' : '' ?>><?= htmlReady($tag->tag) ?></option>
            <? endforeach ?>

            <? foreach ($tags as $tag) : ?>
                <? if (in_array($tag, $task_tags) === false) : ?>
                <option value="<?= htmlReady($tag->tag) ?>"><?= htmlReady($tag->tag) ?></option>
                <? endif ?>
            <? endforeach ?>
        </select>
    </label>

    <?= $this->render_partial('task/_permissions') ?>
    <br>
    <? endif ?>

    <!-- Answer -->
    <? if ($perms['view_answer']) : ?>
        <? if ($task->allow_text) : ?>
        <label <?= ($perms['edit_answer']) ? '' : 'class="mark"' ?>>
            <span><?= _('Antworttext:') ?></span><br>

            <? if ($perms['edit_answer']) : ?>
            <textarea name="task_user[answer]" class="add_toolbar"><?= htmlReady($task_user->answer) ?></textarea><br>
            <? else : ?>
            <?= $task_user->answer
                    ? formatReady($task_user->answer)
                    : '<span class="empty_text">' . _('Es wurde bisher keine Antwort eingegeben.') .'</span>' ?>
            <? endif ?>
        </label>
        <? endif ?>

        <br>

        <? if ($task->allow_files) : ?>
        <?= $this->render_partial('file/list', array(
            'files' => $task_user->files->findBy('type', 'answer'),
            'type' => 'answer',
            'edit' => $perms['edit_answer']
        )) ?>
        <br>
        <? endif ?>
    <? endif ?>

    <!-- Feedback -->
    <? if ($perms['view_feedback']) : ?>
        <label <?= ($perms['edit_feedback']) ? '' : 'class="mark"' ?>>
            <span><?= _('Feedback:') ?></span><br>

            <? if ($perms['edit_feedback']) : ?>
            <textarea name="task_user[feedback]" class="add_toolbar"><?= htmlReady($task_user->feedback) ?></textarea><br>
            <? else : ?>
            <?= $task_user->feedback
                    ? formatReady($task_user->feedback)
                    : '<span class="empty_text">' . _('Es wurde bisher kein Feedback eingegeben.') .'</span>' ?>
            <? endif ?>
        </label>

        <br>

        <? if ($task->allow_files) : ?>
        <?= $this->render_partial('file/list', array(
            'files' => $task_user->files->findBy('type', 'feedback'),
            'type' => 'feedback',
            'edit' => $perms['edit_feedback']
        )) ?>
        <br>
        <? endif ?>
    <? endif ?>


    <!-- Goal -->
    <? if ($perms['view_goal']) : ?>
    <br>
    <label <?= ($perms['edit_goal']) ? '' : 'class="mark"' ?>>
        <span><?= _('Zielvereinbarung:') ?></span><br>

        <? if ($perms['edit_goal']) : ?>
        <textarea name="task_user[goal]" class="add_toolbar"><?= htmlReady($task_user->goal) ?></textarea><br>
        <? else : ?>
        <?= $task_user->goal
                ? formatReady($task_user->goal)
                : '<span class="empty_text">' . _('Es wurde bisher keine Zielvereinbarung eingegeben.') .'</span>' ?>
        <? endif ?>
    </label>
    <? endif ?>

    <!-- Form-Buttons -->
    <div style="text-align: center">
        <div class="button-group">
            <?= Studip\Button::createAccept(_('Aufgabe speichern')) ?>
            <?= Studip\LinkButton::createCancel(_('Abbrechen'), $controller->url_for('task/index/' . $portfolio_id)) ?>
        </div>
    </div>
</form>

<script>
    jQuery(document).ready(function() {
        jQuery('#sets').chosen({
            create_option_text: 'Portfolio erstellen'.toLocaleString()
        });
        jQuery('#tags').chosen({
            create_option: true,
            persistent_create_option: true,
            skip_no_results: true,
            create_option_text: 'Tag erstellen'.toLocaleString()
        });
        
        <? foreach ($task_user->perms as $perm) : ?>
        STUDIP.Portfolio.Homepage.addPermissionTemplate({
            user: '<?= get_username($perm->user_id) ?>',
            fullname: '<?= get_fullname($perm->user_id) ?>',
            perm: '<?= $perm->role ?>',
            permission: '<?= $perm->role == 'tutor' 
                ? _('Betreuer') : ($perm->role == 'student'
                ?  _('Kommilitone') :  _('Nachfolgebetreuer')) ?>'
        });
        <? endforeach ?>
    });
</script>