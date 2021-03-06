package models.business;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import models.BaseModel;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Aaron on 1/1/2015.
 */
public class Scan extends BaseModel
{
    protected Integer id;
    protected Integer hostId;
    protected DateTime created;
    protected Integer inactivePortCount;
    protected String validHost;
    protected List<Port> ports;
    protected List<Integer> portsRemoved;
    protected List<Integer> portsAdded;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getHostId() {
        return hostId;
    }

    public void setHostId(Integer hostId) {
        this.hostId = hostId;
    }

    @JsonProperty("created")
    public Long getCreatedTimestamp()
    {
        return (null == created) ? null : created.getMillis() / 1000;
    }

    @JsonIgnore
    public DateTime getCreated() {
        return created;
    }

    public void setCreated(DateTime created) {
        this.created = created;
    }

    public Integer getInactivePortCount() {
        return inactivePortCount;
    }

    public void setInactivePortCount(Integer inactivePortCount) {
        this.inactivePortCount = inactivePortCount;
    }

    public List<Port> getPorts() {
        return ports;
    }

    public void setPorts(List<Port> ports) {
        this.ports = ports;
    }

    public List<Integer> getPortsRemoved() {
        return portsRemoved;
    }

    public void setPortsRemoved(List<Integer> portsRemoved) {
        this.portsRemoved = portsRemoved;
    }

    public List<Integer> getPortsAdded() {
        return portsAdded;
    }

    public void setPortsAdded(List<Integer> portsAdded) {
        this.portsAdded = portsAdded;
    }

    public String getValidHost() {
        return validHost;
    }

    public void setValidHost(String validHost) {
        this.validHost = validHost;
    }

    public void addPort(Port port)
    {
        if(null == ports)
            ports = new ArrayList<>();

        ports.add(port);
    }
}
