import { ReactNode, useMemo } from 'react';
import {
  RiBarChartBoxLine,
  RiChat1Line,
  RiGroup2Line,
  RiKey2Line,
  RiRouteFill,
  RiSettings4Line,
  RiStore3Line,
  RiUserAddLine,
} from 'react-icons/ri';
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, ROUTES } from '@/utils/routes';
import { TelemetryEvent } from '@/utils/telemetry';
import { useTelemetry } from '@/hooks/use-telemetry';
import { EnvironmentDropdown } from './environment-dropdown';
import { OrganizationDropdown } from './organization-dropdown';
import { FreeTrialCard } from './free-trial-card';
import { SubscribersStayTunedModal } from './subscribers-stay-tuned-modal';
import { SidebarContent } from '@/components/side-navigation/sidebar';
import { NavigationLink } from './navigation-link';
import { GettingStartedMenuItem } from './getting-started-menu-item';
import { ChangelogStack } from './changelog-cards';
import { useFetchSubscription } from '../../hooks/use-fetch-subscription';
import * as Sentry from '@sentry/react';

const NavigationGroup = ({ children, label }: { children: ReactNode; label?: string }) => {
  return (
    <div className="flex flex-col last:mt-auto">
      {!!label && <span className="text-foreground-400 px-2 py-1 text-sm">{label}</span>}
      {children}
    </div>
  );
};

export const SideNavigation = () => {
  const { subscription, daysLeft, isLoading: isLoadingSubscription } = useFetchSubscription();
  const isFreeTrialActive = subscription?.trial.isActive || subscription?.hasPaymentMethod;

  const { currentEnvironment, environments, switchEnvironment } = useEnvironment();
  const track = useTelemetry();
  const environmentNames = useMemo(() => environments?.map((env) => env.name), [environments]);

  const onEnvironmentChange = (value: string) => {
    const environment = environments?.find((env) => env.name === value);
    switchEnvironment(environment?.slug);
  };

  const showPlainLiveChat = () => {
    track(TelemetryEvent.SHARE_FEEDBACK_LINK_CLICKED);

    try {
      window?.Plain?.open();
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error opening plain chat:', error);
    }
  };
  return (
    <aside className="bg-neutral-alpha-50 relative flex h-full w-[275px] flex-shrink-0 flex-col">
      <SidebarContent className="h-full">
        <OrganizationDropdown />
        <EnvironmentDropdown value={currentEnvironment?.name} data={environmentNames} onChange={onEnvironmentChange} />
        <nav className="flex h-full flex-1 flex-col">
          <div className="flex flex-col gap-4">
            <NavigationGroup>
              <NavigationLink to={buildRoute(ROUTES.WORKFLOWS, { environmentSlug: currentEnvironment?.slug ?? '' })}>
                <RiRouteFill className="size-4" />
                <span>Workflows</span>
              </NavigationLink>
              <SubscribersStayTunedModal>
                <span onClick={() => track(TelemetryEvent.SUBSCRIBERS_LINK_CLICKED)}>
                  <NavigationLink>
                    <RiGroup2Line className="size-4" />
                    <span>Subscribers</span>
                  </NavigationLink>
                </span>
              </SubscribersStayTunedModal>
            </NavigationGroup>
            <NavigationGroup label="Monitor">
              <NavigationLink
                to={buildRoute(ROUTES.ACTIVITY_FEED, { environmentSlug: currentEnvironment?.slug ?? '' })}
              >
                <RiBarChartBoxLine className="size-4" />
                <span>Activity Feed</span>
              </NavigationLink>
            </NavigationGroup>
            <NavigationGroup label="Developer">
              <NavigationLink to={buildRoute(ROUTES.INTEGRATIONS, { environmentSlug: currentEnvironment?.slug ?? '' })}>
                <RiStore3Line className="size-4" />
                <span>Integration Store</span>
              </NavigationLink>
              <NavigationLink to={buildRoute(ROUTES.API_KEYS, { environmentSlug: currentEnvironment?.slug ?? '' })}>
                <RiKey2Line className="size-4" />
                <span>API Keys</span>
              </NavigationLink>
            </NavigationGroup>
            <NavigationGroup label="Application">
              <NavigationLink to={ROUTES.SETTINGS}>
                <RiSettings4Line className="size-4" />
                <span>Settings</span>
              </NavigationLink>
            </NavigationGroup>
          </div>

          <div className="relative mt-auto gap-8 pt-4">
            {!isFreeTrialActive && !isLoadingSubscription && <ChangelogStack />}{' '}
            {isFreeTrialActive && !isLoadingSubscription && (
              <FreeTrialCard subscription={subscription} daysLeft={daysLeft} />
            )}
            <NavigationGroup>
              <button onClick={showPlainLiveChat} className="w-full">
                <NavigationLink>
                  <RiChat1Line className="size-4" />
                  <span>Share Feedback</span>
                </NavigationLink>
              </button>
              <NavigationLink to={ROUTES.SETTINGS_TEAM}>
                <RiUserAddLine className="size-4" />
                <span>Invite teammates</span>
              </NavigationLink>

              <GettingStartedMenuItem />
            </NavigationGroup>
          </div>
        </nav>
      </SidebarContent>
    </aside>
  );
};