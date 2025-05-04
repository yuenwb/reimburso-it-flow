
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Settings = () => {
  const [integrationStatus, setIntegrationStatus] = useState({
    rabbitmq: true,
    redis: true,
    stripe: false,
    slack: false,
  });

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState("50");
  
  const handleIntegrationToggle = (integration: keyof typeof integrationStatus) => {
    setIntegrationStatus({
      ...integrationStatus,
      [integration]: !integrationStatus[integration],
    });
    
    toast.success(`${integration.toUpperCase()} integration ${!integrationStatus[integration] ? 'enabled' : 'disabled'}`);
  };
  
  const handleSaveGeneralSettings = () => {
    toast.success("Settings saved successfully");
  };
  
  const handleSaveIntegrationsSettings = () => {
    toast.success("Integration settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system preferences and integrations
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="TechCorp IT Department" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fiscal-year">Fiscal Year</Label>
                <Select defaultValue="jan-dec">
                  <SelectTrigger id="fiscal-year">
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan-dec">January - December</SelectItem>
                    <SelectItem value="apr-mar">April - March</SelectItem>
                    <SelectItem value="jul-jun">July - June</SelectItem>
                    <SelectItem value="oct-sep">October - September</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-approval">Auto Approval for Small Amounts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve requests under a certain threshold
                  </p>
                </div>
                <Switch
                  id="auto-approval"
                  checked={autoApproval}
                  onCheckedChange={setAutoApproval}
                />
              </div>
              
              {autoApproval && (
                <div className="space-y-2">
                  <Label htmlFor="approval-threshold">Auto Approval Threshold ($)</Label>
                  <Input
                    id="approval-threshold"
                    type="number"
                    value={autoApprovalThreshold}
                    onChange={(e) => setAutoApprovalThreshold(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneralSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
              <CardDescription>
                Connect with other systems and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border divide-y">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-medium">RabbitMQ</h4>
                    <p className="text-sm text-muted-foreground">
                      Message queue for notifications and event handling
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={integrationStatus.rabbitmq} />
                    <Switch
                      checked={integrationStatus.rabbitmq}
                      onCheckedChange={() => handleIntegrationToggle('rabbitmq')}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-medium">Redis</h4>
                    <p className="text-sm text-muted-foreground">
                      Caching system for improved performance
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={integrationStatus.redis} />
                    <Switch
                      checked={integrationStatus.redis}
                      onCheckedChange={() => handleIntegrationToggle('redis')}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-medium">Stripe</h4>
                    <p className="text-sm text-muted-foreground">
                      Payment processing for direct reimbursements
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={integrationStatus.stripe} />
                    <Switch
                      checked={integrationStatus.stripe}
                      onCheckedChange={() => handleIntegrationToggle('stripe')}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-medium">Slack</h4>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Slack channels
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={integrationStatus.slack} />
                    <Switch
                      checked={integrationStatus.slack}
                      onCheckedChange={() => handleIntegrationToggle('slack')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveIntegrationsSettings}>Save Integration Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for request updates
                  </p>
                </div>
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>
              
              {emailEnabled && (
                <div className="space-y-4 border rounded-lg p-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-submit" className="rounded" defaultChecked />
                    <Label htmlFor="notify-submit">New request submission</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-status" className="rounded" defaultChecked />
                    <Label htmlFor="notify-status">Status change notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-comment" className="rounded" defaultChecked />
                    <Label htmlFor="notify-comment">Comment notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-reminder" className="rounded" defaultChecked />
                    <Label htmlFor="notify-reminder">Pending approval reminders</Label>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Digest Frequency</Label>
                <Select defaultValue="realtime">
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast.success("Notification settings saved")}>
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Badge component to show connection status
const Badge = ({ status }: { status: boolean }) => {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${
      status 
        ? "bg-green-100 text-green-800" 
        : "bg-gray-100 text-gray-800"
    }`}>
      {status ? "Connected" : "Disconnected"}
    </span>
  );
};

export default Settings;
