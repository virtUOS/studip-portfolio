<?php
/**
 * PortfoliosStudiengangCombos - a study-combo for portfolio
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of
 * the License, or (at your option) any later version.
 *
 * @author      Till Gl�ggler <tgloeggl@uos.de>
 * @license     http://www.gnu.org/licenses/gpl-3.0.html GPL version 3
 * @category    Stud.IP
 * 
 */

namespace Portfolio;

class PortfoliosStudiengangCombos extends \Portfolio_SimpleORMap
{
    /**
     * creates a new studiengang-combo for a portfolio, sets up relations
     * 
     * @param string $id
     */
    public function __construct($id = null)
    {
        $this->db_table = 'portfolio_portfolios_studiengang_combos';

        $this->has_many['study_combos'] = array(
            'class_name'        => 'Portfolio\StudiengangCombos',
            'foreign_key'       => 'combo_id',
            'assoc_foreign_key' => 'combo_id',
            'on_delete'         => 'delete',
            'on_store'          => 'store'
        );

        parent::__construct($id);
    }
}
