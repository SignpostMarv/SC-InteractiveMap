/* global Intl */

import Modal                                    from '../Modal.js';
import Modal_Train_Timetable                    from '../Modal/Train/Timetable.js';

import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

import SubSystem_Railroad                       from '../SubSystem/Railroad.js';

export default class Building_Locomotive
{
    static getTrainName(baseLayout, currentObject, defaultName = null)
    {

        let railroadSubSystem   = new SubSystem_Railroad({baseLayout: baseLayout});
        let trainIdentifier     = railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mTrainName      = baseLayout.getObjectProperty(trainIdentifier, 'mTrainName');
                    if(mTrainName !== null)
                    {
                        return mTrainName;
                    }
            }

            if(defaultName !== null)
            {
                return defaultName;
            }

        return null;
    }

    static getFreightWagons(baseLayout, currentObject)
    {
        let includedPathName    = [currentObject.pathName];
        let freightWagons       = [];

        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
        {
            if(currentObject.extra !== undefined)
            {
                if(currentObject.extra.previousPathName !== undefined && currentObject.extra.previousPathName !== '')
                {
                    let adjacentPreviousWagon   = baseLayout.saveGameParser.getTargetObject(currentObject.extra.previousPathName);
                        while(adjacentPreviousWagon !== null)
                        {
                            includedPathName.push(adjacentPreviousWagon.pathName);

                            if(adjacentPreviousWagon.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
                            {
                                freightWagons.push(adjacentPreviousWagon);
                            }

                            adjacentPreviousWagon = Building_Locomotive.getAdjacentWagon(baseLayout, adjacentPreviousWagon, includedPathName);
                        }
                }
                if(currentObject.extra.nextPathName !== undefined && currentObject.extra.nextPathName !== '')
                {
                    let adjacentNextWagon       = baseLayout.saveGameParser.getTargetObject(currentObject.extra.nextPathName);
                        while(adjacentNextWagon !== null)
                        {
                            includedPathName.push(adjacentNextWagon.pathName);

                            if(adjacentNextWagon.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
                            {
                                freightWagons.push(adjacentNextWagon);
                            }

                            adjacentNextWagon = Building_Locomotive.getAdjacentWagon(baseLayout, adjacentNextWagon, includedPathName);
                        }
                }
            }
        }

        return freightWagons;
    }

    static getAdjacentWagon(baseLayout, currentObject, includedPathName)
    {
        if(currentObject.extra !== undefined)
        {
            if(currentObject.extra.previousPathName !== undefined && currentObject.extra.previousPathName !== '' && includedPathName.includes(currentObject.extra.previousPathName) === false)
            {
                return baseLayout.saveGameParser.getTargetObject(currentObject.extra.previousPathName);
            }
            if(currentObject.extra.nextPathName !== undefined && currentObject.extra.nextPathName !== '' && includedPathName.includes(currentObject.extra.nextPathName) === false)
            {
                return baseLayout.saveGameParser.getTargetObject(currentObject.extra.nextPathName);
            }
        }

        return null;
    }

    static isAutoPilotOn(baseLayout, currentObject)
    {
        let railroadSubSystem   = new SubSystem_Railroad({baseLayout: baseLayout});
        let trainIdentifier     = railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mIsSelfDrivingEnabled   = baseLayout.getObjectProperty(trainIdentifier, 'mIsSelfDrivingEnabled');
                    if(mIsSelfDrivingEnabled !== null && mIsSelfDrivingEnabled === 1)
                    {
                        return true;
                    }
            }

        return false;
    }

    static getVelocity(baseLayout, currentObject)
    {
        let railroadSubSystem   = new SubSystem_Railroad({baseLayout: baseLayout});
        let trainIdentifier     = railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mSimulationData = baseLayout.getObjectProperty(trainIdentifier, 'mSimulationData');
                    if(mSimulationData !== null)
                    {
                        for(let i = 0; i < mSimulationData.values.length; i++)
                        {
                            if(mSimulationData.values[i].name === 'Velocity')
                            {
                                return mSimulationData.values[i].value / 27.778;
                            }
                        }
                    }
            }

        return null;
    }

    static getTimeTable(baseLayout, currentObject)
    {
        let railroadSubSystem   = new SubSystem_Railroad({baseLayout: baseLayout});
        let trainIdentifier     = railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let TimeTable       = baseLayout.getObjectProperty(trainIdentifier, 'TimeTable');
                    if(TimeTable !== null)
                    {
                        return baseLayout.saveGameParser.getTargetObject(TimeTable.pathName);
                    }
            }

        return null;
    }

    static getNextStop(baseLayout, currentObject, specificStop = null)
    {
        let timeTable       = Building_Locomotive.getTimeTable(baseLayout, currentObject);
            if(timeTable !== null)
            {
                let mStops          = baseLayout.getObjectProperty(timeTable, 'mStops');
                let mCurrentStop    = baseLayout.getObjectProperty(timeTable, 'mCurrentStop', 0);
                    if(specificStop !== null)
                    {
                        mCurrentStop = specificStop;
                    }

                    if(mStops !== null && mCurrentStop !== null)
                    {
                        if(mStops.values[mCurrentStop] !== undefined)
                        {
                            let nextStop = mStops.values[mCurrentStop];
                                for(let i = 0; i < nextStop.length; i++)
                                {
                                    if(nextStop[i].name === 'Station')
                                    {
                                        let nextStation = baseLayout.saveGameParser.getTargetObject(nextStop[i].value.pathName);
                                            if(nextStation !== null)
                                            {
                                                return nextStation;
                                            }
                                    }
                                }
                        }
                    }
            }

        return null;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update name',
            callback    : Building_Locomotive.updateSign
        });
        contextMenu.push({
            text        : 'Turn auto-pilot ' + ((Building_Locomotive.isAutoPilotOn(baseLayout, currentObject)) ? '<strong class="text-danger">Off</strong>' : '<strong class="text-success">On</strong>'),
            callback    : Building_Locomotive.updateAutoPilot
        });
        contextMenu.push('-');

        let timeTable = Building_Locomotive.getTimeTable(baseLayout, currentObject);
            if(timeTable !== null)
            {
                let mStops = baseLayout.getObjectProperty(timeTable, 'mStops');
                    if(mStops !== null)
                    {
                        contextMenu.push({
                            icon        : 'fa-train',
                            text        : 'See timetable',
                            callback    : function(){
                                let modalTimetable = new Modal_Train_Timetable({baseLayout: baseLayout, locomotive: currentObject});
                                    modalTimetable.parse();
                            }
                        });
                        contextMenu.push('-');
                    }
            }

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

        let railroadSubSystem   = new SubSystem_Railroad({baseLayout: baseLayout});
        let trainIdentifier     = railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let mTrainName      = baseLayout.getObjectProperty(trainIdentifier, 'mTrainName');

                    Modal.form({
                        title       : 'Update "<strong>' + buildingData.name + '</strong>" sign',
                        container   : '#leafletMap',
                        inputs      : [{
                            name        : 'mTrainName',
                            inputType   : 'text',
                            value       : mTrainName
                        }],
                        callback    : function(values)
                        {
                            if(values !== null)
                            {
                                if(values.mTrainName !== '')
                                {
                                    if(mTrainName !== null)
                                    {
                                        this.setObjectProperty(trainIdentifier, 'mTrainName', values.mTrainName);
                                    }
                                    else
                                    {
                                        trainIdentifier.properties.push({
                                            flags                       : 18,
                                            hasCultureInvariantString   : 1,
                                            historyType                 : 255,
                                            name                        : "mTrainName",
                                            type                        : "TextProperty",
                                            value                       : values.mTrainName
                                        });
                                    }
                                }
                                else
                                {
                                    this.deleteObjectProperty(trainIdentifier, 'mTrainName');
                                }
                            }
                        }.bind(baseLayout)
                    });
            }
    }

    static updateAutoPilot(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let railroadSubSystem   = new SubSystem_Railroad({baseLayout: baseLayout});
        let trainIdentifier     = railroadSubSystem.getObjectIdentifier(currentObject);
            if(trainIdentifier !== null)
            {
                let isAutoPilotOn   = Building_Locomotive.isAutoPilotOn(baseLayout, currentObject);
                    if(isAutoPilotOn === true)
                    {
                        baseLayout.deleteObjectProperty(trainIdentifier, 'mIsSelfDrivingEnabled');
                    }
                    else
                    {
                        baseLayout.setObjectProperty(trainIdentifier, 'mIsSelfDrivingEnabled', 1, 'BoolProperty');
                    }
            }
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content         = [];
        let mTrainName      = Building_Locomotive.getTrainName(baseLayout, currentObject);
            if(mTrainName !== null)
            {
                content.push('<div><strong>' + mTrainName + ' <em class="small">(' + buildingData.name + ')</em></strong></div>');
            }
            else
            {
                content.push('<div><strong>' + buildingData.name + '</strong></div>');
            }

            content.push('<table class="pt-3"><tr>');
                if(buildingData.image !== undefined)
                {
                    content.push('<td class="pr-3"><img src="' + buildingData.image + '" style="width: 128px;height: 128px;" /></td>');
                }

                content.push('<td><table class="text-left">');

                let velocity = Building_Locomotive.getVelocity(baseLayout, currentObject);
                    if(velocity !== null)
                    {
                        content.push('<tr><td>Speed:</td><td class="pl-3 text-right">' + new Intl.NumberFormat(baseLayout.language).format(Math.round(velocity)) + ' km/h</td></tr>');
                    }

                let isAutoPilotOn   = Building_Locomotive.isAutoPilotOn(baseLayout, currentObject);
                    if(isAutoPilotOn === true)
                    {
                        content.push('<tr><td>Auto-pilot:</td><td class="pl-3 text-right text-success">On</td></tr>');

                        let nextStop = Building_Locomotive.getNextStop(baseLayout, currentObject);
                            if(nextStop !== null)
                            {
                                let mStationName = baseLayout.getObjectProperty(nextStop, 'mStationName');
                                    if(mStationName !== null)
                                    {
                                        content.push('<tr><td>Next stop:</td><td class="pl-3 text-right">' + mStationName + '</td></tr>');
                                    }
                            }
                    }
                    else
                    {
                        content.push('<tr><td>Auto-pilot:</td><td class="pl-3 text-right text-danger">Off</td></tr>');
                    }

                let freightWagons   = Building_Locomotive.getFreightWagons(baseLayout, currentObject);
                    if(freightWagons.length > 0)
                    {
                        content.push('<tr><td>Freight wagons:</td><td class="pl-3 text-right">' + new Intl.NumberFormat(baseLayout.language).format(freightWagons.length) + ' </td></tr>');
                    }


                content.push('</table></td>');

            content.push('</tr></table>');

        return '<div class="d-flex" style="border: 25px solid #7f7f7f;border-image: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/genericTooltipBackground.png?v=' + baseLayout.scriptVersion + ') 25 repeat;background: #7f7f7f;margin: -7px;' + BaseLayout_Tooltip.defaultTextStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }
}