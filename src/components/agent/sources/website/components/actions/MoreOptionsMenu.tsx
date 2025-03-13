
import React from "react";
import { MoreVertical, AlertCircle, Eye, FileText, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ActionTooltipButton from "./ActionTooltipButton";
import { WebsiteSourceItem } from "../../WebsiteItem";

interface MoreOptionsMenuProps {
  link: WebsiteSourceItem;
  onDelete: () => void;
  onShowDebug: () => void;
  onDownloadLogs: () => void;
}

const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({
  link,
  onDelete,
  onShowDebug,
  onDownloadLogs
}) => {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>More options</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent>
        {link.status === 'error' && (
          <DropdownMenuItem onClick={onShowDebug} disabled={!link.error}>
            <AlertCircle className="h-4 w-4 mr-2" />
            View error
          </DropdownMenuItem>
        )}
        
        {link.debugLogs && link.debugLogs.length > 0 && (
          <>
            <DropdownMenuItem onClick={onShowDebug}>
              <Eye className="h-4 w-4 mr-2" />
              View logs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadLogs}>
              <FileText className="h-4 w-4 mr-2" />
              Download logs
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreOptionsMenu;

// Fix missing imports
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
