import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";

import worldData from "../assets/maps/countries-110m.json";
import { numericToAlpha3 } from "./CountryCodeMapping";
import { scaleLinear } from "d3-scale";

class WorldMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1,
      center: [0, 0],
      tooltip: {
        visible: false,
        content: "",
        x: 0,
        y: 0
      }
    };
  }

  handleZoomIn = () => {
    this.setState(prevState => ({ zoom: prevState.zoom * 1.5 }));
  };

  handleZoomOut = () => {
    this.setState(prevState => ({ zoom: prevState.zoom / 1.5 }));
  };

  handleMoveEnd = (position) => {
    this.setState({ center: position.coordinates, zoom: position.zoom });
  };

  handleMouseEnter = (geo, value, event) => {
    const { clientX, clientY } = event;
    const name = geo.properties.name || "Unknown";
    this.setState({
      tooltip: {
        visible: true,
        content: `${name}: ${value ? value.toLocaleString('en-US') : "0"}`,
        x: clientX,
        y: clientY
      }
    });
  };

  handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    this.setState(prevState => ({
      tooltip: {
        ...prevState.tooltip,
        x: clientX,
        y: clientY
      }
    }));
  };

  handleMouseLeave = () => {
    this.setState({
      tooltip: {
        visible: false,
        content: "",
        x: 0,
        y: 0
      }
    });
  };

  render() {
    const { countrySplitList = [] } = this.props;
    const { tooltip } = this.state;

    // 🔹 Build totals from your JSON
    const countryTotals = {};

    countrySplitList.forEach(ele => {
      const total = Object.values(ele.amount || {})
        .reduce((sum, val) => sum + val, 0);

      countryTotals[ele.country.code] = total;
    });

    const maxValue = Math.max(...Object.values(countryTotals), 0);
    const colorScale = scaleLinear()
      .domain([0, maxValue])
      .range(["#E6F2FF", "#002F6C"]);

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {this.props.title && (
          <div style={{ 
            textAlign: "center", 
            marginBottom: "10px", 
            fontSize: "12px", 
            fontWeight: "bold",
            color: this.props.isDarkMode ? "#fff" : "#666"
          }}>
            {this.props.title}
          </div>
        )}
        <ComposableMap 
          projectionConfig={{ scale: 160, center: [20, -10] }} 
          width={800} 
          height={400} 
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup 
            zoom={this.state.zoom} 
            center={this.state.center} 
            onMoveEnd={this.handleMoveEnd} 
            disableScrolling
          >
            <Geographies geography={worldData}>
              {({ geographies }) =>
                geographies.map(geo => {
                  let isoCode =
                    geo.properties?.ISO_A3 ||
                    geo.properties?.iso_a3 ||
                    geo.properties?.ADM0_A3;

                  if (!isoCode && geo.id) {
                    isoCode = numericToAlpha3[geo.id] || geo.id;
                  }

                  const value = countryTotals[isoCode];
                  // console.log("Hello",value,isoCode,geo.rsmKey)
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        value
                          ? colorScale(value)
                          : "#EEE"
                      }
                      stroke="#FFF"
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#BA0C2F", outline: "none", cursor: "pointer" },
                        pressed: { outline: "none" }
                      }}
                      onMouseEnter={(event) => this.handleMouseEnter(geo, value, event)}
                      onMouseMove={this.handleMouseMove}
                      onMouseLeave={this.handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom Buttons */}
        <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <button 
                onClick={this.handleZoomIn}
                style={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    width: "30px",
                    height: "30px",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                title="Zoom In"
            >
                +
            </button>
            <button 
                onClick={this.handleZoomOut}
                style={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    width: "30px",
                    height: "30px",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                title="Zoom Out"
            >
                -
            </button>
        </div>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            style={{
              position: "fixed",
              top: tooltip.y + 15,
              left: tooltip.x + 15,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              pointerEvents: "none",
              zIndex: 9999,
              whiteSpace: "nowrap"
            }}
          >
            {tooltip.content}
          </div>
        )}

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            right: "0",
            display: "flex",
            alignItems: "center",
            fontSize: "10px",
            color: "#666",
            zIndex: 100
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100px", marginRight: "5px", textAlign: "right", color: this.props.isDarkMode ? "#fff" : "#666"  }}>
            <span>{maxValue.toLocaleString('en-US')}</span>
            <span>0</span>
          </div>
          <div
            style={{
              width: "10px",
              height: "100px",
              background: "linear-gradient(to top, #E6F2FF, #002F6C)",
              border: "1px solid #ccc"
            }}
          />
        </div>
      </div>
    );
  }
}

export default WorldMap;
