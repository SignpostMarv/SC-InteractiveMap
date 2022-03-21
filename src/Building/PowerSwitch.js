import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Building_PowerSwitch
{
    static isOn(baseLayout, currentObject)
    {
        let mIsSwitchOn = baseLayout.getObjectPropertyValue(currentObject, 'mIsSwitchOn');
            if(mIsSwitchOn !== null && mIsSwitchOn === 1)
            {
                return true;
            }

        return false;
    }

    static getSign(baseLayout, currentObject)
    {
        let mBuildingTag = baseLayout.getObjectPropertyValue(currentObject, 'mBuildingTag');
            if(mBuildingTag !== null && mBuildingTag !== '')
            {
                return mBuildingTag;
            }

        return null;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-power-off',
            text        : 'Turn ' + ((Building_PowerSwitch.isOn(baseLayout, currentObject) === false) ? '<strong class="text-success">On' : '<strong class="text-danger">Off</strong>'),
            callback    : Building_PowerSwitch.updateState
        });

        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update name',
            callback    : Building_PowerSwitch.updateSign
        });
        contextMenu.push('-');

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateSign(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let currentSign     = Building_PowerSwitch.getSign(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" sign',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mBuildingTag',
                    inputType   : 'text',
                    value       : currentSign
                }],
                callback    : function(values)
                {
                    if(values !== null)
                    {
                        if(values.mBuildingTag !== '')
                        {
                            baseLayout.setObjectProperty(currentObject, {
                                name: 'mHasBuildingTag',
                                type: 'BoolProperty',
                                value:  1
                            });
                            baseLayout.setObjectProperty(currentObject, {
                                name: 'mBuildingTag',
                                type: 'StrProperty',
                                value:  values.mBuildingTag
                            });
                        }
                        else
                        {
                            baseLayout.deleteObjectProperty(currentObject, 'mHasBuildingTag');
                            baseLayout.deleteObjectProperty(currentObject, 'mBuildingTag');
                        }
                    }
                }
            });
    }

    static updateState(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let isOn            = Building_PowerSwitch.isOn(baseLayout, currentObject);

            if(isOn === true)
            {
                baseLayout.deleteObjectProperty(currentObject, 'mIsSwitchOn');
            }
            else
            {
                baseLayout.setObjectProperty(currentObject, {
                    name: 'mIsSwitchOn',
                    type: 'BoolProperty',
                    value:  1
                });
            }
    }
}