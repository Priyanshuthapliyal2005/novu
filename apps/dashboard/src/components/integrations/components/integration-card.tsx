import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';
import { ROUTES } from '@/utils/routes';
import { ChannelTypeEnum, type IEnvironment, type IIntegration, type IProviderConfig } from '@novu/shared';
import { RiCheckboxCircleFill, RiGitBranchFill, RiSettings4Line, RiStarSmileLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/ui';
import { TableIntegration } from '../types';
import { ProviderIcon } from './provider-icon';
import { isDemoIntegration } from './utils/helpers';

type IntegrationCardProps = {
  integration: IIntegration;
  provider: IProviderConfig;
  environment: IEnvironment;
  onClick: (item: TableIntegration) => void;
};

export function IntegrationCard({ integration, provider, environment, onClick }: IntegrationCardProps) {
  const navigate = useNavigate();

  const handleConfigureClick = (e: React.MouseEvent) => {
    if (integration.channel === ChannelTypeEnum.IN_APP && !integration.connected) {
      e.stopPropagation();

      navigate(ROUTES.INBOX_EMBED + `?environmentId=${environment._id}`);
    } else {
      onClick({
        integrationId: integration._id ?? '',
        name: integration.name,
        identifier: integration.identifier,
        provider: provider.displayName,
        channel: integration.channel,
        environment: environment.name,
        active: integration.active,
      });
    }
  };

  const isDemo = isDemoIntegration(provider.id);

  return (
    <div
      className={cn(
        'bg-card shadow-xs group relative flex min-h-[125px] cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border border-neutral-200 p-3 transition-all hover:shadow-lg',
        !integration.active && 'opacity-75 grayscale'
      )}
      onClick={handleConfigureClick}
      data-test-id={`integration-${integration._id}-row`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <div className="relative h-6 w-6">
            <ProviderIcon
              providerId={provider.id}
              providerDisplayName={provider.displayName}
              className="h-full w-full"
            />
          </div>
          <span className="text-sm font-medium">{integration.name}</span>
        </div>
        {integration.primary && (
          <Tooltip>
            <TooltipTrigger>
              <RiStarSmileLine className="text-feature h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>This is your primary integration for the {provider.channel} channel.</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isDemo && (
          <Tooltip>
            <TooltipTrigger className="flex h-[16px] items-center gap-1">
              <span className="flex h-[16px] items-center gap-1">
                <Badge variant="warning" className="text-2xs h-[16px] rounded-sm text-[#F6B51E]">
                  DEMO
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                This is a demo provider for testing purposes only and capped at 300{' '}
                {provider.channel === 'email' ? 'emails' : 'sms'} per month. Not suitable for production use.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2">
        {integration.channel === ChannelTypeEnum.IN_APP && !integration.connected ? (
          <Button
            size="xs"
            leadingIcon={RiSettings4Line}
            className="h-[26px]"
            variant="secondary"
            mode="outline"
            onClick={handleConfigureClick}
          >
            Connect
          </Button>
        ) : (
          <Badge variant={integration.active ? 'success' : 'neutral'} className="capitalize">
            <RiCheckboxCircleFill className="text-success h-4 w-4" />
            {integration.active ? 'Active' : 'Inactive'}
          </Badge>
        )}
        <Badge variant="outline" className="shadow-none">
          <RiGitBranchFill
            className={cn('h-4 w-4', environment.name.toLowerCase() === 'production' ? 'text-feature' : 'text-warning')}
          />
          {environment.name}
        </Badge>
      </div>
    </div>
  );
}