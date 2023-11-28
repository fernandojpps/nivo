/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { memo, Fragment, useCallback } from 'react'
import { SvgWrapper, withContainer, useDimensions, useTheme, bindDefs } from '@nivo/core'
import { BoxLegendSvg } from '@nivo/legends'
import { useTooltip } from '@nivo/tooltip'
import { ChoroplethPropTypes, ChoroplethDefaultProps } from './props'
import GeoGraticule from './GeoGraticule'
import GeoMapFeature from './GeoMapFeature'
import { useGeoMap, useChoropleth } from './hooks'
import ChoroplethTooltip from './ChoroplethTooltip'

const Choropleth = memo(props => {
    const {
        width,
        height,
        margin: partialMargin,
        features,
        data,
        match,
        label,
        value,
        valueFormat,
        projectionType,
        projectionScale,
        projectionTranslation,
        projectionRotation,
        colors,
        domain,
        unknownColor,
        borderWidth,
        borderColor,
        enableGraticule,
        graticuleLineWidth,
        graticuleLineColor,
        layers,
        legends,
        isInteractive,
        onClick,
        tooltip,
        role,
        defs,
        fill,
    } = { ...ChoroplethDefaultProps, ...props }
    const Tooltip = tooltip ?? ChoroplethTooltip

    const { margin, outerWidth, outerHeight } = useDimensions(width, height, partialMargin)
    const { graticule, path, getBorderWidth, getBorderColor } = useGeoMap({
        width,
        height,
        projectionType,
        projectionScale,
        projectionTranslation,
        projectionRotation,
        fillColor: () => { },
        borderWidth,
        borderColor,
    })
    const { getFillColor, boundFeatures, legendData } = useChoropleth({
        features,
        data,
        match,
        label,
        value,
        valueFormat,
        colors,
        unknownColor,
        domain,
    })

    const theme = useTheme()

    const boundDefs = bindDefs(defs, boundFeatures, fill, {
        dataKey: 'data',
        targetKey: 'fill',
    })

    const { showTooltipFromEvent, hideTooltip } = useTooltip()
    const handleClick = useCallback(
        (feature, event) => isInteractive && onClick && onClick(feature, event),
        [isInteractive, onClick]
    )
    const handleMouseEnter = useCallback(
        (feature, event) =>
            isInteractive && Tooltip && showTooltipFromEvent(<Tooltip feature={feature} />, event),
        [isInteractive, showTooltipFromEvent, Tooltip]
    )
    const handleMouseMove = useCallback(
        (feature, event) =>
            isInteractive && Tooltip && showTooltipFromEvent(<Tooltip feature={feature} />, event),
        [isInteractive, showTooltipFromEvent, Tooltip]
    )
    const handleMouseLeave = useCallback(
        () => isInteractive && hideTooltip(),
        [isInteractive, hideTooltip]
    )

    return (
        <SvgWrapper
            width={outerWidth}
            height={outerHeight}
            margin={margin}
            theme={theme}
            defs={boundDefs}
            role={role}
        >
            {layers.map((layer, i) => {
                if (layer === 'graticule') {
                    if (enableGraticule !== true) return null

                    return (
                        <GeoGraticule
                            key="graticule"
                            path={path}
                            graticule={graticule}
                            lineWidth={graticuleLineWidth}
                            lineColor={graticuleLineColor}
                        />
                    )
                }
                if (layer === 'features') {
                    return (
                        <Fragment key="features">
                            {boundFeatures.map(feature => (
                                <GeoMapFeature
                                    key={feature.id}
                                    feature={feature}
                                    path={path}
                                    fillColor={getFillColor(feature)}
                                    borderWidth={getBorderWidth(feature)}
                                    borderColor={getBorderColor(feature)}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={handleClick}
                                />
                            ))}
                        </Fragment>
                    )
                }
                if (layer === 'legends') {
                    return legends.map((legend, i) => {
                        return (
                            <BoxLegendSvg
                                key={i}
                                containerWidth={width}
                                containerHeight={height}
                                data={legendData}
                                {...legend}
                            />
                        )
                    })
                }

                return <Fragment key={i}>{layer({})}</Fragment>
            })}
        </SvgWrapper>
    )
})

Choropleth.displayName = 'Choropleth'
Choropleth.propTypes = ChoroplethPropTypes

export default withContainer(Choropleth)
